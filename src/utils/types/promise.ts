import { Promisify } from "taio/build/types/promise";
export type PromisifyMethods<T> = {
  [K in keyof T]: T[K] extends (...args: infer Params) => infer Result
    ? (...args: Params) => Promisify<Result>
    : PromisifyMethods<T[K]>;
};
