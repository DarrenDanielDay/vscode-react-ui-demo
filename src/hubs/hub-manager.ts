import type * as vscode from "vscode";
import type { Event, Hub } from "../react-ui/communication";
import type { CoreHubEvents } from "../react-ui/message-protocol";
import type { PropertyKeys } from "../utils/types/property-key";

export class HubDispatcher<T> implements Hub<T>, vscode.Disposable {
  private handlersMap = new Map<
    PropertyKeys<T>,
    Set<(value: T[PropertyKeys<T>]) => void>
  >();
  dispose() {
    this.handlersMap.clear();
    this.handlers.clear();
  }
  private handlers = new Set<
    (event: PropertyKeys<T>, value: T[PropertyKeys<T>]) => void
  >();
  onEach(handler: (event: PropertyKeys<T>, value: T[PropertyKeys<T>]) => void) {
    this.handlers.add(handler);
  }
  offEach(
    handler: (event: PropertyKeys<T>, value: T[PropertyKeys<T>]) => void
  ) {
    this.handlers.delete(handler);
  }
  on<K extends PropertyKeys<T>>(
    event: K,
    handler: (value: T[K]) => void
  ): void {
    this.handlersMap.has(event) || this.handlersMap.set(event, new Set());
    // @ts-expect-error
    this.handlersMap.get(event)!.add(handler);
  }
  off<K extends PropertyKeys<T>>(
    event: K,
    handler: (value: T[K]) => void
  ): void {
    this.handlersMap.has(event) || this.handlersMap.set(event, new Set());
    // @ts-expect-error
    this.handlersMap.get(event)!.delete(handler);
  }
  emit<K extends PropertyKeys<T>>(event: K, value: T[K]): void {
    this.handlers.forEach((handler) => handler.call(undefined, event, value));
    this.handlersMap
      .get(event)
      ?.forEach((handler) => handler.call(undefined, value));
  }
}

export class HubManager implements vscode.Disposable {
  private static _instance?: HubManager;
  static get instance() {
    this._instance = this._instance ?? new HubManager();
    return this._instance;
  }
  webviews = new Set<vscode.Webview>();
  dipatcher = new HubDispatcher<CoreHubEvents>();
  constructor() {
    this.dipatcher.onEach((name, payload) => {
      this.webviews.forEach((webview) => {
        const event: Event<any> = {
          id: 0,
          name,
          payload,
          type: "event",
        };
        webview.postMessage(event);
      });
    });
  }
  dispose() {
    this.dipatcher.dispose();
  }
  attach(webview: vscode.Webview) {
    this.webviews.add(webview);
  }
  detach(webview: vscode.Webview) {
    this.webviews.delete(webview);
  }

  eventHandler = (event: Event<any>) => {
    // @ts-expect-error
    this.dipatcher.emit(event.name, event.payload);
  };
}
