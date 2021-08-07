import type { PropertyKeys } from "../../utils/types/property-key";
import type { AnyMessage, Event, Request, Response } from "../communication";
import type { CoreEvents } from "../message-protocol";
import { json } from "./json-serializer";
if (typeof acquireVsCodeApi !== "function") {
  alert(
    "You need to run this app in vscode's webview. Some APIs are not available in browsers."
  );
  // Polyfill to prevent errors.
  (() => {
    let _state: unknown;
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
  reject(error?: unknown): void;
}

export interface IMessageManager {
  handlerMap: Map<
    PropertyKeys<CoreEvents>,
    Set<(value: CoreEvents[PropertyKeys<CoreEvents>]) => void>
  >;
  messageQueue: Map<number, PromiseHandler<unknown>>;
  readonly seq: number;
  enqueue(handler: PromiseHandler<unknown>): number;
  accept(seq: number, payload: unknown): void;
  abort(seq: number, error?: unknown): void;
  request(path: string[], payload: unknown[]): Promise<Response<unknown>>;
  dispatchToExtension<K extends PropertyKeys<CoreEvents>>(
    name: K,
    payload: CoreEvents[K]
  ): void;
  onEvent<K extends PropertyKeys<CoreEvents>>(
    name: K,
    handler: (value: CoreEvents[K]) => void
  ): void;
  offEvent<K extends PropertyKeys<CoreEvents>>(
    name: K,
    handler: (value: CoreEvents[K]) => void
  ): void;
  listener: (event: { data: AnyMessage }) => void;
}

export function createMessageManager(): IMessageManager {
  let _seq = 0;
  const messageQueue = new Map<number, PromiseHandler<unknown>>();
  const handlerMap = new Map<
    PropertyKeys<CoreEvents>,
    Set<(value: CoreEvents[PropertyKeys<CoreEvents>]) => void>
  >();
  function getNextSeq() {
    return _seq++;
  }
  const listener = (event: { data: AnyMessage }) => {
    const message = json.parse(event.data) as AnyMessage;
    if (message.type === "response") {
      instance.accept(message.id, message.payload.data);
    } else if (message.type === "error") {
      instance.abort(
        message.id,
        message.payload.error ?? message.payload.message
      );
    } else if (message.type === "event") {
      // @ts-expect-error Cannot expect the name to be statically checked.
      dispatchEvent(message.name, message.payload);
    }
  };
  function dispatchEvent<K extends PropertyKeys<CoreEvents>>(
    name: K,
    payload: CoreEvents[K]
  ): void {
    instance.handlerMap.get(name)?.forEach((handler) => {
      handler.call(undefined, payload);
    });
  }
  function enqueue(handler: PromiseHandler<unknown>) {
    const nextSeq = getNextSeq();
    messageQueue.set(nextSeq, handler);
    return nextSeq;
  }
  function accept(seq: number, payload: unknown) {
    const { resolve } = messageQueue.get(seq) ?? {};
    resolve?.(payload);
    messageQueue.delete(seq);
  }
  function abort(seq: number, error?: unknown) {
    const { reject } = messageQueue.get(seq) ?? {};
    reject?.(error);
    messageQueue.delete(seq);
  }
  async function request(
    path: string[],
    payload: unknown[]
  ): Promise<Response<unknown>> {
    return new Promise((resolve, reject) => {
      const id = enqueue({ resolve, reject });
      const request: Request<unknown[]> = {
        payload: {
          path,
          args: payload,
        },
        id,
        type: "request",
      };
      window.vscodeAPI.postMessage(json.serialize(request));
    });
  }

  function dispatchToExtension<K extends PropertyKeys<CoreEvents>>(
    name: K,
    payload: CoreEvents[K]
  ): void {
    const event: Event<CoreEvents[K]> = {
      id: 0,
      name,
      payload,
      type: "event",
    };

    window.vscodeAPI.postMessage(json.serialize(event));
  }

  function onEvent<K extends PropertyKeys<CoreEvents>>(
    name: K,
    handler: (value: CoreEvents[K]) => void
  ) {
    handlerMap.has(name) || handlerMap.set(name, new Set());
    handlerMap.get(name)!.add(handler);
  }

  function offEvent<K extends PropertyKeys<CoreEvents>>(
    name: K,
    handler: (value: CoreEvents[K]) => void
  ) {
    handlerMap.has(name) || handlerMap.set(name, new Set());
    handlerMap.get(name)!.delete(handler);
  }
  const instance: IMessageManager = {
    get handlerMap() {
      return handlerMap;
    },
    get messageQueue() {
      return messageQueue;
    },
    get seq() {
      return _seq;
    },
    enqueue,
    listener,
    accept,
    abort,
    request,
    dispatchToExtension,
    onEvent,
    offEvent,
  };
  return instance;
}

export const globalMessageManager = createMessageManager();
