import { StringAccessPaths } from "taio/build/types/object";

type PrimitiveTypes =
  | string
  | number
  | boolean
  | undefined
  | null
  | symbol
  | bigint;

type TemplateAllowedTypes =
  | string
  | number
  | boolean
  | null
  | undefined
  | bigint;

export type AccessPaths<T> = T extends object
  ? {
      [K in keyof T]: [K] | [K, ...AccessPaths<T[K]>];
    }[keyof T]
  : [];

export type StringAccessKeyOf<T> = T extends PrimitiveTypes
  ? never
  : `${Extract<keyof T, TemplateAllowedTypes>}`;

type CutFirst<Arr extends unknown[]> = Arr extends [unknown, ...infer Rest]
  ? Rest
  : [];

type Join<Arr extends string[]> = Arr extends []
  ? ""
  : Arr extends [infer T]
  ? T extends string
    ? T
    : never
  : `${Arr[0]}.${Join<CutFirst<Arr>>}`;
// @ts-ignore
export type Paths<T> = Join<StringAccessPaths<T>>;

type Split<Str extends string> = Str extends `${infer Head}.${infer Tail}`
  ? [Head, ...Split<Tail>]
  : [Str];

export type ArrayAccess<T, Path extends StringAccessPaths<T>> = Path extends readonly [

]
  ? T
  : // @ts-ignore
    ArrayAccess<T[Path[0]], CutFirst<Path>>;
export type Access<T, Path extends Paths<T>> = Split<Path> extends infer OnePath
  ? OnePath extends []
    ? T
    : // @ts-ignore
      ArrayAccess<T, OnePath>
  : never;
