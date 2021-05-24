import type { CoreAPI } from "../message-protocol";
import type { PromisifyMethods } from '../../utils/types/promise'
declare global {
  // This is a simple implementation for calling extension API in webview.
  // See index.tsx for more details.
  var SessionInvoker: PromisifyMethods<CoreAPI>;
}
