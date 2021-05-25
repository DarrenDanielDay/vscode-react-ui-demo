import * as vscode from "vscode";
import { WebviewManager } from "./react-ui/extension-handler";
import "./controller";
import { MessageManager } from "./message/message-manager";
import * as child_process from "child_process";
import * as path from "path";
let uiBuildProcess: child_process.ChildProcess | null = null;
export function activate(context: vscode.ExtensionContext) {
  const webviewManager = new WebviewManager();
  const { open: doOpen, reload, close } = webviewManager;
  const openCommandHandler = function open(
    this: WebviewManager,
    ctx: vscode.ExtensionContext
  ) {
    doOpen.call(this, ctx);
    webviewManager.attach(MessageManager.instance.messageHandler);
  };
  [openCommandHandler, reload, close].forEach((command) => {
    const disposable = vscode.commands.registerCommand(
      `vscode-react-ui-demo.${command.name}`,
      command.bind(webviewManager, context)
    );
    context.subscriptions.push(disposable);
  });
  setImmediate(() => {
    //#region UI builder
    uiBuildProcess = child_process.fork(
      path.resolve(
        context.extensionPath,
        "src",
        "react-ui",
        "start-esbuild.mjs"
      ),
      [],
      {
        cwd: path.resolve(context.extensionPath, "src", "react-ui"),
      }
    );
    uiBuildProcess.stdout?.addListener("data", (chunk) => {
      console.log(chunk);
      if (Buffer.isBuffer(chunk)) {
        console.log(chunk.toString("utf-8"));
        webviewManager.reload(context);
      }
    });
    uiBuildProcess.addListener("message", (message) => {
      console.log("Message from UI builder process:", message);
      if (message === "Rebuild") {
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
    //#endregion
    openCommandHandler.call(webviewManager, context);
  });
}

export function deactivate() {
  if (uiBuildProcess) {
    uiBuildProcess.removeAllListeners();
    uiBuildProcess.kill("SIGKILL");
  }
}
