import type { CoreAPI, CoreEvents } from "../message-protocol";
import type { PromisifyMethods } from "../../utils/types/promise";
import { EventHub } from "../communication";

declare global {
  // This is a simple implementation for calling extension API in webview.
  // See index.tsx for more details.
  var SessionInvoker: PromisifyMethods<CoreAPI>;
  var SessionHubs: EventHub<CoreEvents>;
}
