import { ControllerManager } from "../controller/controller-decorator";
import { Message, Request } from "../react-ui/communication";

export class MessageManager {
  private static _instance?: MessageManager;
  static get instance() {
    return (this._instance ??= new MessageManager());
  }
  isMessage(obj: any): obj is Message<any> {
    return (
      !!obj &&
      typeof obj.id === "number" &&
      typeof obj.type === "string" &&
      !!obj.payload
    );
  }
  isRequest(obj: any): obj is Request<any> {
    return (
      this.isMessage(obj) &&
      obj.type === "request" &&
      Array.isArray(obj.payload.args)
    );
  }
  messageHandler = (e: any) => {
    if (this.isRequest(e)) {
      return ControllerManager.instance.requestHandler(e.payload.path, e);
    }
  };
}
