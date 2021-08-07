import type { Error, Request, Response } from "../app/communication";
import { access } from "../utils";
import type * as vscode from "vscode";
import { createCoreAPI } from "./core-module";

export interface IModuleManager<T> {
  readonly api: T;
  useImpl(api: T): void;
  callModuleAPI(path: string[], params: readonly unknown[]): Promise<unknown>;
  requestHandler: (
    path: string[],
    request: Request<unknown[]>
  ) => Promise<Error<unknown> | Response<unknown>>;
}

export function createModuleManager<T>(api: T): IModuleManager<T> {
  function useImpl(newApi: T) {
    api = newApi;
  }
  const requestHandler = async (
    path: string[],
    request: Request<unknown[]>
  ): Promise<Error<unknown> | Response<unknown>> => {
    const { id, payload } = request;
    try {
      const data = await callModuleAPI(path, payload.args);
      return {
        payload: { path, data },
        type: "response",
        id,
      };
    } catch (error: unknown) {
      const newLocal =
        error instanceof Error ? error.message : JSON.stringify(error);
      return {
        id,
        type: "error",
        payload: {
          error,
          message: newLocal,
        },
      };
    }
  };
  async function callModuleAPI(
    path: string[],
    params: readonly unknown[]
  ): Promise<unknown> {
    // @ts-expect-error Access path cannot be statically checked
    const method = access(api, path);
    if (typeof method === "function") {
      return method.apply(
        // @ts-expect-error Access path cannot be statically checked
        access(api, path.slice(0, path.length - 1)),
        params
      );
    } else {
      throw new Error(
        `Cannot call module method with path '${path.join(".")}'.`
      );
    }
  }
  const instance: IModuleManager<T> = {
    get api() {
      return api;
    },
    useImpl,
    callModuleAPI: callModuleAPI,
    requestHandler,
  };
  return instance;
}
