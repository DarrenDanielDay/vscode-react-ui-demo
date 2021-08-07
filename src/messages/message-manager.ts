import { globalModuleManager } from "../modules/module-manager";
import { globalEventHubAdapter } from "../events/event-manager";
import type { Event, Message, Request } from "../app/communication";

function isMessage(obj: unknown): obj is Message<unknown> {
  return (
    typeof obj === "object" &&
    !!obj &&
    typeof Reflect.get(obj, "id") === "number" &&
    typeof Reflect.get(obj, "type") === "string" &&
    !!Reflect.get(obj, "payload")
  );
}
function isRequest(obj: unknown): obj is Request<unknown[]> {
  return (
    isMessage(obj) &&
    obj.type === "request" &&
    typeof obj.payload === "object" &&
    !!obj.payload &&
    Array.isArray(Reflect.get(obj.payload, "args"))
  );
}
function isEvent(obj: unknown): obj is Event<unknown> {
  return isMessage(obj) && obj.type === "event";
}

export const globalMessageHandler = (e: unknown) => {
  if (isRequest(e)) {
    return globalModuleManager.requestHandler(e.payload.path, e);
  }
  if (isEvent(e)) {
    return globalEventHubAdapter.eventHandler(e);
  }
};
