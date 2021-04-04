import type {
  Message,
  ProtocalCommand,
  UIRequestExtensionProtocol,
} from "../message-protocol";

// @ts-ignore
const vscode: { postMessage(params: Message<any>): any } = acquireVsCodeApi();

export interface PromiseHandler<T> {
  resolve(data: T): void;
  reject(error?: any): void;
}

export class MessageManager {
  private static _instance: MessageManager | undefined;
  static get instance() {
    return (this._instance ??= new MessageManager());
  }
  private constructor() {}

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
  async request<K extends ProtocalCommand>(
    command: K,
    payload: UIRequestExtensionProtocol[K]["request"]
  ): Promise<UIRequestExtensionProtocol[K]["response"]> {
    return new Promise((resolve, reject) => {
      const seq = this.enqueue({ resolve, reject });
      const message: Message<any> = {
        command,
        hasError: false,
        payload,
        seq,
        type: "request",
      };
      vscode.postMessage(message);
    });
  }

  listener = (event: { data: Message<any> }) => {
    const message = event.data;
    const { hasError, payload, seq, type } = message;
    if (type === "response") {
      if (hasError) {
        this.abort(seq, payload);
      } else {
        this.accept(seq, payload);
      }
    }
  };
}
