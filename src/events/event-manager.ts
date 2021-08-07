import type * as vscode from "vscode";
import type { Event, EventHub } from "../app/communication";
import type { CoreEvents } from "../app/message-protocol";
import { json } from "../app/src/json-serializer";
import type { PropertyKeys } from "../utils/types/property-key";

interface IEventDispatcher<T> extends EventHub<T>, vscode.Disposable {
  onEach(
    handler: (event: PropertyKeys<T>, value: T[PropertyKeys<T>]) => void
  ): void;
  offEach(
    handler: (event: PropertyKeys<T>, value: T[PropertyKeys<T>]) => void
  ): void;
}

export function createDispatcher<T>(): IEventDispatcher<T> {
  const handlersMap = new Map<
    PropertyKeys<T>,
    Set<(value: T[PropertyKeys<T>]) => void>
  >();

  const handlers = new Set<
    (event: PropertyKeys<T>, value: T[PropertyKeys<T>]) => void
  >();
  function onEach(
    handler: (event: PropertyKeys<T>, value: T[PropertyKeys<T>]) => void
  ) {
    handlers.add(handler);
  }
  function offEach(
    handler: (event: PropertyKeys<T>, value: T[PropertyKeys<T>]) => void
  ) {
    handlers.delete(handler);
  }
  function on<K extends PropertyKeys<T>>(
    event: K,
    handler: (value: T[K]) => void
  ): void {
    handlersMap.has(event) || handlersMap.set(event, new Set());
    // @ts-expect-error Key mapping
    handlersMap.get(event)!.add(handler);
  }
  function off<K extends PropertyKeys<T>>(
    event: K,
    handler: (value: T[K]) => void
  ): void {
    handlersMap.has(event) || handlersMap.set(event, new Set());
    // @ts-expect-error Key mapping
    handlersMap.get(event)!.delete(handler);
  }
  function emit<K extends PropertyKeys<T>>(event: K, value: T[K]): void {
    handlers.forEach((handler) => handler.call(undefined, event, value));
    handlersMap
      .get(event)
      ?.forEach((handler) => handler.call(undefined, value));
  }
  return {
    dispose() {
      handlersMap.clear();
      handlers.clear();
    },
    on,
    off,
    emit,
    onEach,
    offEach,
  };
}

export interface IEventHubAdapter<T> extends vscode.Disposable {
  webviews: Set<vscode.Webview>;
  dispatcher: IEventDispatcher<T>;
  eventHandler: (event: Event<unknown>) => void;
  attach(webview: vscode.Webview): void;
  detach(webview: vscode.Webview): void;
}

export function createEventHubAdapter<T>(): IEventHubAdapter<T> {
  const webviews = new Set<vscode.Webview>();
  const dispatcher = createDispatcher<T>();
  const eventHandler = (event: Event<unknown>) => {
    // @ts-expect-error Cannot expect the name to be statically checked
    dispatcher.emit(event.name, event.payload);
  };
  dispatcher.onEach((name, payload) => {
    webviews.forEach((webview) => {
      const event: Event<unknown> = {
        id: 0,
        name,
        payload,
        type: "event",
      };
      webview.postMessage(json.serialize(event));
    });
  });
  return {
    webviews,
    dispatcher,
    dispose() {
      dispatcher.dispose();
    },
    attach(webview: vscode.Webview) {
      webviews.add(webview);
    },
    detach(webview: vscode.Webview) {
      webviews.delete(webview);
    },
    eventHandler,
  };
}
