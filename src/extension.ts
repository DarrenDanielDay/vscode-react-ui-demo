import * as vscode from "vscode";
import * as child_process from "child_process";
import * as path from "path";
import env from "@esbuild-env";
import { MessageManager } from "./message/message-manager";
import { WebviewManager } from "./react-ui/extension-handler";
import { Inject } from "./controller/controller-decorator";
import "./controller";
import { HubManager } from "./hubs/hub-manager";
import { Commands } from "./commands";
let uiBuildProcess: child_process.ChildProcess | null = null;
export function activate(context: vscode.ExtensionContext) {
  Inject.context = context;
  const webviewManager = new WebviewManager();
  context.subscriptions.push(webviewManager);
  context.subscriptions.push(HubManager.instance);
  const { open: doOpen, reload, close } = webviewManager;
  const open = function (this: WebviewManager, ctx: vscode.ExtensionContext) {
    doOpen.call(this, ctx);
    webviewManager.messageHandler ||
      webviewManager.attach(MessageManager.instance.messageHandler);
    HubManager.instance.attach(webviewManager.panel!.webview);
  };
  const interval = setInterval(() => {
    HubManager.instance.dipatcher.emit(
      "chat",
      "Dispatched by interval in extension"
    );
  }, 3000);
  context.subscriptions.push({
    dispose() {
      clearInterval(interval);
    },
  });
  HubManager.instance.dipatcher.on("chat", (message) => {
    console.log("extension listener", message);
  });
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Commands.WebviewControll.Open,
      open.bind(webviewManager, context)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Commands.WebviewControll.Close,
      close.bind(webviewManager, context)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Commands.WebviewControll.Reload,
      reload.bind(webviewManager, context)
    )
  );
  if (env.ENV === "dev") {
    startUIDevMode(context, webviewManager).then(() => {
      console.log("Successfully built React UI resources");
      vscode.commands.executeCommand(Commands.WebviewControll.Open).then(() => {
        console.log("Successfully opened webview");
      });
    });
  }
}

export function deactivate() {
  Inject.context = undefined;
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
