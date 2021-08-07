import type { PropertyKeys } from "../utils/types/property-key";

export interface DataTransferMiddleware {
  serialize(value: unknown): unknown;
  parse(value: unknown): unknown;
}

export type MessageType = "error" | "event" | "request" | "response";

export interface Message<T> {
  type: MessageType;
  id: number;
  payload: T;
}

export type AnyMessage =
  | Error<unknown>
  | Event<unknown>
  | Request<unknown[]>
  | Response<unknown>;

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
  name: string;
}

export interface EventHub<T> {
  on<K extends PropertyKeys<T>>(event: K, handler: (value: T[K]) => void): void;
  off<K extends PropertyKeys<T>>(
    event: K,
    handler: (value: T[K]) => void
  ): void;
  emit<K extends PropertyKeys<T>>(event: K, value: T[K]): void;
}
