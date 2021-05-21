// Note that you can only import relative modules end with `.js` suffix in the UI sub-project.
// Because this UI demo is based on CDN react bundle and `script` tag with `type="module"`.
import { App } from "./app.js";
import { MessageManager } from "./messager.js";

// Use `import type` for your type defined. These imports will be ignored by tsc.
window.addEventListener("message", MessageManager.instance.listener);
const noop = () => {
  // Do nothing
};
function createTrackerProxy(path: string[]): any {
  return new Proxy(noop, {
    get(_, key) {
      if (typeof key !== "string") {
        throw new Error(
          `Cannot use symbol path, detected using symbol ${key.toString()}`
        );
      }
      path.push(key);
      return createTrackerProxy(path);
    },
    apply(_target, _thisArg, argArray) {
      // @ts-expect-error
      return MessageManager.instance.request(path, argArray);
    },
  });
}
window.SessionInvoker = new Proxy(
  {},
  {
    get(_target, key: string) {
      return createTrackerProxy([key]);
    },
  }
) as never;
ReactDOM.render(<App></App>, document.getElementById("app"));
