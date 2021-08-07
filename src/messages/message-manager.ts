import type { IModuleManager } from "../modules/module-manager";
import type { IEventHubAdapter } from "../events/event-manager";
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

export function createMessageHandler<APIs, Events>({
  eventAdapter,
  moduleManager,
}: {
  moduleManager: IModuleManager<APIs>;
  eventAdapter: IEventHubAdapter<Events>;
}) {
  return (e: unknown) => {
    if (isRequest(e)) {
      return moduleManager.requestHandler(e.payload.path, e);
    }
    if (isEvent(e)) {
      return eventAdapter.eventHandler(e);
    }
  };
}
