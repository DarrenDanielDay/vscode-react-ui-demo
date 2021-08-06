import type { Error, Request, Response } from "../react-ui/communication";
import { access } from "../utils";
import type * as vscode from "vscode";
import { createCoreAPI } from "./core-controller";

interface IControllerManager<T> {
  readonly api: T;
  useImpl(api: T): void;
  callController(path: string[], params: readonly unknown[]): Promise<unknown>;
  requestHandler: (
    path: string[],
    request: Request<unknown[]>
  ) => Promise<Response<unknown> | Error<unknown>>;
}

export function createControllerManager<T>(api: T): IControllerManager<T> {
  function useImpl(newApi: T) {
    api = newApi;
  }
  const requestHandler = async (
    path: string[],
    request: Request<unknown[]>
  ): Promise<Response<unknown> | Error<unknown>> => {
    const { id, payload } = request;
    try {
      const data = await callController(path, payload.args);
      return {
        payload: { path, data },
        type: "response",
        id,
      };
    } catch (error) {
      return {
        id,
        type: "error",
        payload: {
          error,
          message: error?.message,
        },
      };
    }
  };
  async function callController(
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
        `Cannot call controller method with path '${path.join(".")}'.`
      );
    }
  }
  const instance: IControllerManager<T> = {
    get api() {
      return api;
    },
    useImpl,
    callController,
    requestHandler,
  };
  return instance;
}

export const globalControllerManager = createControllerManager(createCoreAPI());
