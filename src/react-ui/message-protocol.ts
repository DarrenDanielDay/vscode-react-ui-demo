// Define your protocol here, and implement them in `controllers` with best practice!

export interface UIRequestExtensionProtocol {
  logInput: Protocol<string, string>;
}

export type MessageType = "request" | "response";

export interface Message<T> {
  type: MessageType;
  seq: number;
  command: ProtocalCommand;
  payload: T;
  hasError: boolean;
}

export interface Request<T> extends Message<T> {
  type: "request";
}

export interface Response<T> extends Message<T> {
  type: "response";
}

export interface Protocol<P, R> {
  request: P;
  response: R;
}

export type ProtocalCommand = keyof UIRequestExtensionProtocol;

export type UIRequestController = {
  [K in ProtocalCommand]: (
    param: UIRequestExtensionProtocol[K]["request"]
  ) => Promise<UIRequestExtensionProtocol[K]["response"]>;
};
