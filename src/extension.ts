import * as vscode from "vscode";
import env from "@esbuild-env";
import { WebviewManager } from "./react-ui/extension-handler";
import "./controller";
import { MessageManager } from "./message/message-manager";
import * as child_process from "child_process";
import * as path from "path";
import { Inject } from "./controller/controller-decorator";
import { TypedObject } from "taio/build/libs/object";
let uiBuildProcess: child_process.ChildProcess | null = null;
export function activate(context: vscode.ExtensionContext) {
  Inject.context = context;
  const webviewManager = new WebviewManager();
  const { open: doOpen, reload, close } = webviewManager;
  const openCommandHandler = function (
    this: WebviewManager,
    ctx: vscode.ExtensionContext
  ) {
    doOpen.call(this, ctx);
    webviewManager.attach(MessageManager.instance.messageHandler);
  };
  TypedObject.defineProperty(openCommandHandler, "name", { value: "open" });
  [openCommandHandler, reload, close].forEach((command) => {
    const disposable = vscode.commands.registerCommand(
      `vscode-react-ui-demo.${command.name}`,
      command.bind(webviewManager, context)
    );
    context.subscriptions.push(disposable);
  });
  setImmediate(() => {
    if (env.ENV === "dev") {
      startUIDevMode(context, webviewManager).then(() => {
        openCommandHandler.call(webviewManager, context);
      });
    } else {
      openCommandHandler.call(webviewManager, context);
    }
  });
}

export function deactivate() {
  if (uiBuildProcess) {
    uiBuildProcess.removeAllListeners();
    uiBuildProcess.kill("SIGKILL");
  }
}

function startUIDevMode(
  context: vscode.ExtensionContext,
  webviewManager: WebviewManager
): Promise<void> {
  const script = path.resolve(
    context.extensionPath,
    "src",
    "react-ui",
    "esbuild-for-ui.mjs"
  );
  uiBuildProcess = child_process.fork(script, ["--dev"], {
    cwd: path.resolve(context.extensionPath, "src", "react-ui"),
  });
  uiBuildProcess.stdout?.addListener("data", (chunk) => {
    console.log(chunk);
    if (Buffer.isBuffer(chunk)) {
      console.log(chunk.toString("utf-8"));
      webviewManager.reload(context);
    }
  });
  uiBuildProcess.addListener("close", (code) => {
    console.log("UI builder process terminated, code =", code);
  });
  uiBuildProcess.addListener("error", (err) => {
    console.error("UI build process crashed:", err);
  });
  uiBuildProcess.addListener("disconnect", () => {
    console.log("UI builder process disconnected");
  });
  uiBuildProcess.addListener("exit", (code) => {
    console.log("UI builder process exited, code =", code);
  });
  let ready = false;
  return new Promise((resolve) => {
    uiBuildProcess &&
      uiBuildProcess.addListener("message", (message) => {
        console.log("Message from UI builder process:", message);
        if (message === "Rebuild") {
          webviewManager.reload(context);
        }
        if (message === "Ready" && !ready) {
          setTimeout(() => {
            ready = true;
            resolve();
          }, 0);
        }
      });
  });
}
