import ReactDOM from "react-dom";
import React from "react";
import { MessageManager } from "./messager";
import { App } from "./app";
import type { Hub } from "../communication";

window.addEventListener("message", MessageManager.instance.listener);
const noop = () => {
  // Do nothing
};
function createTrackerProxy(
  path: string[],
  callHandler: (path: string[], argArray: unknown[]) => void
): any {
  return new Proxy(noop, {
    get(_, key) {
      if (typeof key !== "string") {
        throw new Error(
          `Cannot use symbol path, detected using symbol ${key.toString()}`
        );
      }
      const newPath = [...path, key];
      return createTrackerProxy(newPath, callHandler);
    },
    apply(_target, _thisArg, argArray) {
      return callHandler(path, argArray);
    },
  });
}
window.SessionInvoker = new Proxy(
  {},
  {
    get(_target, key: string) {
      return createTrackerProxy([key], (path, argArray) => {
        return MessageManager.instance.request(path, argArray);
      });
    },
  }
) as never;
window.SessionHubs = new Proxy(
  {},
  {
    get(_target, key: keyof Hub<any>) {
      return createTrackerProxy([key], (path, argArray) => {
        // @ts-expect-error
        const method: keyof Hub<any> = path[path.length - 1];
        if (method === "on") {
          // @ts-expect-error
          MessageManager.instance.onEvent(...argArray);
        }
        if (method === "off") {
          // @ts-expect-error
          MessageManager.instance.offEvent(...argArray);
        }
        if (method === "emit") {
          // @ts-expect-error
          MessageManager.instance.dispatchToExtension(...argArray);
        }
      });
    },
  }
) as never;
ReactDOM.render(<App></App>, document.getElementById("root"));
