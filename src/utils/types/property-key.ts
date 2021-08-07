export type PropertyKeys<T> = {
  [K in Extract<keyof T, string>]: T[K] extends (
    ...args: readonly unknown[]
  ) => void
    ? never
    : K;
}[Extract<keyof T, string>];
