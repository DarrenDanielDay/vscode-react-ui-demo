type AccessByPath<T, Path extends AccessPaths<T>> = Path extends readonly []
  ? T
  : Path extends [infer Current, ...infer Rest]
  ? Current extends keyof T
    ? Rest extends AccessPaths<T[Current]>
      ? AccessByPath<T[Current], Rest>
      : never
    : never
  : never;

type AccessPaths<T> = T extends object
  ? {
      [K in keyof T]: [K, ...AccessPaths<T[K]>] | [K];
    }[keyof T]
  : [];

export function access<T, Path extends AccessPaths<T>>(
  source: T,
  path: Path
): AccessByPath<T, Path> {
  // @ts-expect-error Infinite type infer
  if (!Array.isArray(path) || path.some((p) => typeof p !== "string")) {
    throw new Error("Access path must be string array");
  }
  let result: unknown = source;
  for (const key of path as string[]) {
    const wrappedResult = Object(result) as object;
    result = Reflect.get(wrappedResult, key, wrappedResult);
  }
  // @ts-expect-error Access result cannot be infered
  return result;
}
