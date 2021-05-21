export type MessageType = "request" | "response" | "event" | "error";

export interface Message<T> {
  type: MessageType;
  id: number;
  payload: T;
}

export type AnyMessage = Request<any> | Response<any> | Event<any> | Error<any>;

export interface RequestPayload<Args extends readonly unknown[]> {
  path: string[];
  args: Args;
}

export interface Request<T extends readonly unknown[]>
  extends Message<RequestPayload<T>> {
  type: "request";
}

export interface ResponsePayload<T> {
  path: string[];
  data: T;
}

export interface Response<T> extends Message<ResponsePayload<T>> {
  type: "response";
}

export interface ErrorPayload<E> {
  error?: E;
  message?: string;
}

export interface Error<E> extends Message<ErrorPayload<E>> {
  type: "error";
}

export interface Event<T> extends Message<T> {
  type: "event";
}