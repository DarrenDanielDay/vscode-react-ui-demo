import { ArrayAccess, StringAccessPaths } from "./types/path";

export function toJSON(obj: unknown): string {
  return JSON.stringify(obj);
}

export function access<T, Path extends StringAccessPaths<T>>(
  source: T,
  path: Path
): ArrayAccess<T, Path> {
  // @ts-expect-error
  if (!Array.isArray(path) || path.some(p => typeof p !== "string")) {
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


access({a: {b: 1}}, ["a"])