export type PropertyKeys<T> = {
  [K in keyof T]: T[K] extends (...args: readonly unknown[]) => void
    ? never
    : K;
}[keyof T];
