/* eslint-disable @typescript-eslint/naming-convention */
import type { DataTransferMiddleware } from "../communication";
interface PrimitiveDescriber {
  __$typeof$__: "bigint" | "symbol";
  literal: string;
}
const isPrimitiveDescriber = (obj: unknown): obj is PrimitiveDescriber => {
  return Object.prototype.hasOwnProperty.call(obj, "__$typeof$__");
};
export const json: DataTransferMiddleware = {
  parse(value: unknown) {
    switch (typeof value) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return value;
      case "object":
        return value && parseObject(value);
      default:
        return value;
    }
  },
  serialize(value: unknown) {
    switch (typeof value) {
      case "boolean":
      case "number":
      case "string":
      case "undefined":
        return value;
      case "bigint":
        const bigintDesc: PrimitiveDescriber = {
          __$typeof$__: "bigint",
          literal: value.toString(),
        };
        return bigintDesc;
      case "symbol":
        const symbolDesc: PrimitiveDescriber = {
          __$typeof$__: "symbol",
          literal: value.toString(),
        };
        return symbolDesc;
      case "object":
        return value && serializeObject(value);
      default:
        return null;
    }
  },
};

function serializeObject(value: object): object {
  if (Array.isArray(value)) {
    return value.map((item) => json.serialize(item));
  }
  return getAllKeys(value).reduce((prev, curr) => {
    const property: unknown = Reflect.get(value, curr);
    if (typeof property !== "function") {
      Reflect.set(prev, curr, json.serialize(property));
    }
    return prev;
  }, {});
}

function getAllKeys(obj: object): string[] {
  const keys = new Set<string>(
    Object.keys(Object.getOwnPropertyDescriptors(obj))
  );
  let prototype: unknown = Object.getPrototypeOf(obj);
  while (prototype !== null) {
    for (const key of Object.keys(
      Object.getOwnPropertyDescriptors(prototype)
    )) {
      keys.add(key);
    }
    prototype = Object.getPrototypeOf(prototype);
  }
  return [...keys];
}

function parseObject(value: object): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => json.parse(item));
  }
  if (isPrimitiveDescriber(value)) {
    switch (value.__$typeof$__) {
      case "bigint":
        return BigInt(value.literal);
      case "symbol":
        return Symbol.for(value.literal);
      default:
        throw new Error(`Unknown typeof: ${value.__$typeof$__}`);
    }
  }
  return Object.keys(value).reduce((prev, curr) => {
    Reflect.set(prev, curr, json.parse(Reflect.get(value, curr)));
    return prev;
  }, {});
}
