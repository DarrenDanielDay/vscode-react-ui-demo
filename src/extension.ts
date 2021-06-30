import * as vscode from "vscode";
import env from "@esbuild-env";
import { MessageManager } from "./message/message-manager";
import { WebviewManager } from "./webview-handler";
import { Inject } from "./controller/controller-decorator";
import "./controller";
import { HubManager } from "./hubs/hub-manager";
import { Commands } from "./commands";
import { loadSnowpackConfig } from "./dev/snowpack-dev";

export function activate(context: vscode.ExtensionContext) {
  Inject.context = context;
  const webviewManager = new WebviewManager(context);
  context.subscriptions.push(webviewManager);
  context.subscriptions.push(HubManager.instance);
  const { open: doOpen, reload, close } = webviewManager;
  const open = function (this: WebviewManager) {
    doOpen.call(this);
    webviewManager.messageHandler ||
      webviewManager.attach(MessageManager.instance.messageHandler);
    HubManager.instance.attach(webviewManager.panel!.webview);
  };
  const interval = setInterval(() => {
    HubManager.instance.dipatcher.emit(
      "chat",
      "Dispatched by interval in extension"
    );
  }, 10000);
  context.subscriptions.push({
    dispose() {
      clearInterval(interval);
    },
  });
  HubManager.instance.dipatcher.on("chat", (message) => {
    console.log("Extension received chat event message:", message);
  });
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Commands.WebviewControll.Open,
      open.bind(webviewManager)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Commands.WebviewControll.Close,
      close.bind(webviewManager)
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      Commands.WebviewControll.Reload,
      reload.bind(webviewManager)
    )
  );
  if (env.ENV === "dev") {
    loadSnowpackConfig(context).then((config) => {
      webviewManager.devServerConfig = {
        port: config.devOptions.port,
        hmrSocketPort: config.devOptions.hmrPort ?? config.devOptions.port,
      };
      vscode.commands.executeCommand(Commands.WebviewControll.Open).then(() => {
        console.log("Successfully opened webview");
      });
    });
  }
}

export function deactivate() {
  Inject.context = undefined;
}
