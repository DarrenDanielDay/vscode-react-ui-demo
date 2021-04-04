import {
  Message,
  ProtocalCommand,
  Request,
  Response,
  UIRequestExtensionProtocol,
} from "../react-ui/message-protocol";

export class ControllerManager {
  private static _instance: ControllerManager | undefined;
  static get instance() {
    return (this._instance ??= new ControllerManager());
  }
  static toJSON<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  }

  contorllers = new Set<{ new (): any }>();
  async callController<K extends ProtocalCommand>(
    command: K,
    params: UIRequestExtensionProtocol[K]["request"]
  ): Promise<UIRequestExtensionProtocol[K]["response"]> {
    const controller = [...this.contorllers].find(
      (controller) => !!controller.prototype[command]
    );
    if (controller) {
      const controllerInstance = new controller();
      const result = await controllerInstance[command](params);
      return result;
    } else {
      throw new Error(
        "Cannot find corresponding command implementation class."
      );
    }
  }

  messageHandler = async (message: Request<any>): Promise<Response<any>> => {
    const { command, hasError, payload, seq, type } = message;
    if (hasError) {
      return null as never;
    }
    try {
      const result = await this.callController(command, payload);
      return {
        command,
        hasError: false,
        payload: ControllerManager.toJSON(result),
        seq,
        type: "response",
      };
    } catch (error) {
      return {
        command,
        hasError: true,
        payload: ControllerManager.toJSON(error),
        seq,
        type: "response",
      };
    }
  };
}
// @ts-ignore
export const Controller: ClassDecorator = (target: { new (): any }) => {
  ControllerManager.instance.contorllers.add(target);
};

export const Inject = {
  singleTone<T = any>(
    creator: () => T,
    readonly: boolean = true
  ): PropertyDecorator {
    const decorator: PropertyDecorator = (target, key) => {
      const value = creator();
      const desctiptor: PropertyDescriptor = readonly
        ? {
            get() {
              return value;
            },
          }
        : {
            value,
          };
      Object.defineProperty(target, key, desctiptor);
    };
    return decorator;
  },
  scoped<T = any>(creator: () => T): PropertyDecorator {
    const decorator: PropertyDecorator = (target, key) => {
      const desctiptor: PropertyDescriptor = {
        get() {
          const value = creator();
          return value;
        },
      };
      Object.defineProperty(target, key, desctiptor);
    };
    return decorator;
  },
};
