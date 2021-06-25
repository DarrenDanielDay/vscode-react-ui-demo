import type { AccessByPath, AccessPaths } from "taio/build/types/object";

export function toJSON(obj: unknown): string {
  return JSON.stringify(obj);
}

export function access<T, Path extends AccessPaths<T>>(
  source: T,
  path: Path
): AccessByPath<T, Path> {
  // @ts-expect-error
  if (!Array.isArray(path) || path.some((p) => typeof p !== "string")) {
    throw new Error("Access path must be string array");
  }
  let result: unknown = source;
  for (const key of path as string[]) {
    const wrappedResult = Object(result);
    result = Reflect.get(wrappedResult, key, wrappedResult);
  }
  // @ts-expect-error
  return result;
}
