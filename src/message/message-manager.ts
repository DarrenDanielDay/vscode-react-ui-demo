import { globalControllerManager } from "../controller/controller-decorator";
import { globalHubManager } from "../hubs/hub-manager";
import type { Event, Message, Request } from "../react-ui/communication";

function isMessage(obj: any): obj is Message<any> {
  return (
    !!obj &&
    typeof obj.id === "number" &&
    typeof obj.type === "string" &&
    !!obj.payload
  );
}
function isRequest(obj: any): obj is Request<any> {
  return (
    isMessage(obj) && obj.type === "request" && Array.isArray(obj.payload.args)
  );
}
function isEvent(obj: any): obj is Event<any> {
  return isMessage(obj) && obj.type === "event";
}

export function globalMessageHandler(e: unknown) {
  return (e: any) => {
    if (isRequest(e)) {
      return globalControllerManager.requestHandler(e.payload.path, e);
    }
    if (isEvent(e)) {
      return globalHubManager.eventHandler(e);
    }
  };
}
