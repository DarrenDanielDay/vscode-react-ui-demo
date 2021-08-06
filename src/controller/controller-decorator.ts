import type { Error, Request, Response } from "../react-ui/communication";
import { access } from "../utils";
import type * as vscode from "vscode";
interface ControllerConstructor {
  new (): unknown;
}

interface IControllerManager {
  readonly controllers: Set<ControllerConstructor>;
  registerController(controller: ControllerConstructor): void;
  callController(path: string[], params: readonly unknown[]): Promise<unknown>;
  requestHandler: (
    path: string[],
    request: Request<unknown[]>
  ) => Promise<Response<unknown> | Error<unknown>>;
}

export function createControllerManager(): IControllerManager {
  const controllers = new Set<ControllerConstructor>();
  const requestHandler = async (
    path: string[],
    request: Request<unknown[]>
  ): Promise<Response<unknown> | Error<unknown>> => {
    const { id, payload } = request;
    try {
      const data = await instance.callController(path, payload.args);
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
  function registerController(controller: ControllerConstructor) {
    controllers.add(controller);
  }
  function findController(path: string[]): ControllerConstructor {
    const accessMapping = new Map<ControllerConstructor, any>();
    controllers.forEach((controller) => {
      accessMapping.set(controller, controller.prototype);
    });
    const pathName = path.join(".");
    for (const key of path) {
      const currentTargets = [...accessMapping.entries()];
      for (const [controller, target] of currentTargets) {
        if (!Reflect.has(target, key)) {
          accessMapping.delete(controller);
        } else {
          accessMapping.set(controller, Reflect.get(target, key));
        }
      }
      if (!accessMapping.size) {
        throw new Error(`No controller found for path '${pathName}'`);
      }
    }
    if (accessMapping.size !== 1) {
      throw new Error(`Multiple implementation found for path '${pathName}'`);
    }
    return [...accessMapping][0]![0];
  }
  async function callController(
    path: string[],
    params: readonly unknown[]
  ): Promise<unknown> {
    const pathName = path.join(".");
    const controller = findController(path);
    if (controller) {
      const controllerInstance = new controller();
      const method = access(controllerInstance, path as []);
      if (typeof method === "function") {
        return method.apply(
          access(controllerInstance, path.slice(0, path.length - 1) as []),
          params
        );
      } else {
        throw new Error(
          `Cannot call controller method with path '${pathName}'.`
        );
      }
    } else {
      throw new Error(
        `Cannot find corresponding command implementation class for path '${pathName}'.`
      );
    }
  }
  const instance: IControllerManager = {
    get controllers() {
      return controllers;
    },
    registerController,
    callController,
    requestHandler,
  };
  return instance;
}

export const globalControllerManager = createControllerManager();

export const Inject = {
  singleton<T>(creator: () => T, readonly: boolean = true): PropertyDecorator {
    const decorator: PropertyDecorator = (target, key) => {
      const value = creator();
      const descriptor: PropertyDescriptor = readonly
        ? {
            get() {
              return value;
            },
          }
        : {
            value,
          };
      Object.defineProperty(target, key, descriptor);
    };
    return decorator;
  },
  scoped<T>(creator: () => T): PropertyDecorator {
    const decorator: PropertyDecorator = (target, key) => {
      const descriptor: PropertyDescriptor = {
        get() {
          const value = creator();
          return value;
        },
      };
      Object.defineProperty(target, key, descriptor);
    };
    return decorator;
  },
  withContext<T>(
    creator: (context: vscode.ExtensionContext) => T
  ): PropertyDecorator {
    return Inject.scoped(() => {
      if (!Inject.context) {
        throw new Error("Context not found!");
      }
      return creator(Inject.context);
    });
  },
  context: undefined as undefined | vscode.ExtensionContext,
};
