import type { CoreAPI } from "../message-protocol";
import type { PromisifyMethods } from '../../utils/types/promise'
declare global {
  // Define your global variables here.
  // Don't forget to inject them into window!
  // `React` and `ReactDOM` will be injected with CDN script tag.
  var React: typeof import("react");
  var ReactDOM: typeof import("react-dom");
  // This is a simple implementation for calling extension API in webview.
  // See index.tsx for more details.
  var SessionInvoker: PromisifyMethods<CoreAPI>;
}
