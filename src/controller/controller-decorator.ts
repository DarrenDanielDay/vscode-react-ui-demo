import type { Error, Request, Response } from "../react-ui/communication";
import { access, toJSON } from "../utils";
import type * as vscode from "vscode";
interface ControllerConstructor {
  new (): unknown;
}

export class ControllerManager {
  private static _instance: ControllerManager | undefined;
  static get instance() {
    this._instance = this._instance ?? new ControllerManager();
    return this._instance;
  }
  static toJSONObject<T>(obj: T): T {
    if (typeof obj === "object") {
      return JSON.parse(toJSON(obj));
    }
    return obj;
  }

  readonly controllers = new Set<ControllerConstructor>();
  registerController(controller: ControllerConstructor) {
    this.controllers.add(controller);
  }

  findController(path: string[]): ControllerConstructor {
    const accessMapping = new Map<ControllerConstructor, any>();
    this.controllers.forEach((controller) => {
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
  async callController(
    path: string[],
    params: readonly unknown[]
  ): Promise<unknown> {
    const pathName = path.join(".");
    const controller = this.findController(path);
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

  requestHandler = async (
    path: string[],
    request: Request<unknown[]>
  ): Promise<Response<unknown> | Error<unknown>> => {
    const { id, payload } = request;
    try {
      const result = await this.callController(path, payload.args);
      return {
        payload: { path, data: ControllerManager.toJSONObject(result) },
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
}
// @ts-expect-error
export const Controller: ClassDecorator = (target: ControllerConstructor) => {
  ControllerManager.instance.registerController(target);
};

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
    return this.scoped(() => {
      if (!this.context) {
        throw new Error("Context not found!");
      }
      return creator(this.context);
    });
  },
  context: undefined as undefined | vscode.ExtensionContext,
};
