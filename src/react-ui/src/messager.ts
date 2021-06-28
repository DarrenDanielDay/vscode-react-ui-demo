import type { PropertyKeys } from "../../utils/types/property-key";
import type { AnyMessage, Event, Request, Response } from "../communication";
import type { CoreHubEvents } from "../message-protocol";

if (typeof acquireVsCodeApi !== "function") {
  alert(
    "You need to run this app in vscode's webview. Some APIs are not available in browsers."
  );
  // Polyfill to prevent errors.
  (() => {
    let _state: any;
    window.acquireVsCodeApi = () => ({
      getState() {
        return _state;
      },
      setState(state) {
        _state = state;
      },
      postMessage() {
        console.warn("vscode.postMessage is not available");
      },
    });
  })();
}

window.vscodeAPI = acquireVsCodeApi();

export interface PromiseHandler<T> {
  resolve(data: T): void;
  reject(error?: any): void;
}

export class MessageManager {
  private static _instance: MessageManager | undefined;
  static get instance() {
    this._instance = this._instance ?? new MessageManager();
    return this._instance;
  }

  messageQueue = new Map<number, PromiseHandler<any>>();
  handlerMap = new Map<
    PropertyKeys<CoreHubEvents>,
    Set<(value: CoreHubEvents[PropertyKeys<CoreHubEvents>]) => void>
  >();
  private _seq = 0;
  get seq() {
    return this._seq;
  }
  getNextSeq() {
    return this._seq++;
  }
  enqueue(handler: PromiseHandler<any>) {
    const nextSeq = this.getNextSeq();
    this.messageQueue.set(nextSeq, handler);
    return nextSeq;
  }
  accept(seq: number, payload: any) {
    const { resolve } = this.messageQueue.get(seq) ?? {};
    resolve?.(payload);
    this.messageQueue.delete(seq);
  }
  abort(seq: number, error?: any) {
    const { reject } = this.messageQueue.get(seq) ?? {};
    reject?.(error);
    this.messageQueue.delete(seq);
  }
  async request(
    path: string[],
    payload: unknown[]
  ): Promise<Response<unknown>> {
    return new Promise((resolve, reject) => {
      const id = this.enqueue({ resolve, reject });
      const request: Request<unknown[]> = {
        payload: {
          path,
          args: payload,
        },
        id,
        type: "request",
      };
      window.vscodeAPI.postMessage(request);
    });
  }

  dispatchToExtension<K extends PropertyKeys<CoreHubEvents>>(
    name: K,
    payload: CoreHubEvents[K]
  ): void {
    const event: Event<CoreHubEvents[K]> = {
      id: 0,
      name,
      payload,
      type: "event",
    };
    window.vscodeAPI.postMessage(event);
  }

  onEvent<K extends PropertyKeys<CoreHubEvents>>(
    name: K,
    handler: (value: CoreHubEvents[K]) => void
  ) {
    this.handlerMap.has(name) || this.handlerMap.set(name, new Set());
    this.handlerMap.get(name)!.add(handler);
  }

  offEvent<K extends PropertyKeys<CoreHubEvents>>(
    name: K,
    handler: (value: CoreHubEvents[K]) => void
  ) {
    this.handlerMap.has(name) || this.handlerMap.set(name, new Set());
    this.handlerMap.get(name)!.delete(handler);
  }

  private dispatchEvent<K extends PropertyKeys<CoreHubEvents>>(
    name: K,
    payload: CoreHubEvents[K]
  ): void {
    this.handlerMap.get(name)?.forEach((handler) => {
      handler.call(undefined, payload);
    });
  }

  listener = (event: { data: AnyMessage }) => {
    const message = event.data;
    if (message.type === "response") {
      this.accept(message.id, message.payload.data);
    } else if (message.type === "error") {
      this.abort(message.id, message.payload.error ?? message.payload.message);
    } else if (message.type === "event") {
      // @ts-expect-error
      this.dispatchEvent(message.name, message.payload);
    }
  };
}
