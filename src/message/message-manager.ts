import { ControllerManager } from "../controller/controller-decorator";
import { HubManager } from "../hubs/hub-manager";
import type { Event, Message, Request } from "../react-ui/communication";

export class MessageManager {
  private static _instance?: MessageManager;
  static get instance() {
    this._instance = this._instance ?? new MessageManager();
    return this._instance;
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
  isEvent(obj: any): obj is Event<any> {
    return this.isMessage(obj) && obj.type === "event";
  }
  messageHandler = (e: any) => {
    if (this.isRequest(e)) {
      return ControllerManager.instance.requestHandler(e.payload.path, e);
    }
    if (this.isEvent(e)) {
      return HubManager.instance.eventHandler(e);
    }
  };
}
