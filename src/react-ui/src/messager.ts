import type { AnyMessage, Message, Request, Response } from "../communication";
import type { AccessByPath, AccessPaths } from "taio/build/types/object";
import type { AnyFunc } from "taio/build/types/concepts";
import type { CoreAPI } from "../message-protocol";
// @ts-ignore
const vscode: { postMessage(params: Message<any>): any } = acquireVsCodeApi();

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
  async request<K extends AccessPaths<CoreAPI>>(
    path: K,
    payload: Parameters<Extract<AccessByPath<CoreAPI, K>, AnyFunc>>
  ): Promise<Response<ReturnType<Extract<AccessByPath<CoreAPI, K>, AnyFunc>>>> {
    return new Promise((resolve, reject) => {
      const id = this.enqueue({ resolve, reject });
      const request: Request<
        Parameters<Extract<AccessByPath<CoreAPI, K>, AnyFunc>>
      > = {
        payload: {
          path,
          args: payload,
        },
        id,
        type: "request",
      };
      vscode.postMessage(request);
    });
  }

  listener = (event: { data: AnyMessage }) => {
    const message = event.data;
    if (message.type === "response") {
      this.accept(message.id, message.payload.data);
    } else if (message.type === "error") {
      this.abort(message.id, message.payload.error ?? message.payload.message);
    }
  };
}
