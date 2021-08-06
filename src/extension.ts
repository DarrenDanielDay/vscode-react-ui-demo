import * as vscode from "vscode";
import env from "@esbuild-env";
import { createWebviewManager, IWebviewManager } from "./webview-handler";
import {
  globalControllerManager,
  Inject,
} from "./controller/controller-decorator";
import { globalHubManager } from "./hubs/hub-manager";
import { Commands } from "./commands";
import { loadSnowpackConfig } from "./dev/snowpack-dev";
import { createCoreAPI } from "./controller/core-controller";
import { globalMessageHandler } from "./message/message-manager";

export function activate(context: vscode.ExtensionContext) {
  Inject.context = context;
  globalControllerManager.registerController(createCoreAPI);
  const webviewManager = createWebviewManager(context);
  context.subscriptions.push(webviewManager);
  context.subscriptions.push(globalHubManager);
  const { open: doOpen, reload, close } = webviewManager;
  const open = function (this: IWebviewManager) {
    doOpen.call(this);
    webviewManager.messageHandler ||
      webviewManager.attach(globalMessageHandler);
    globalHubManager.attach(webviewManager.panel!.webview);
  };
  if (env.ENV === "dev") {
    const interval = setInterval(() => {
      globalHubManager.dispatcher.emit(
        "chat",
        "Dispatched by interval in extension"
      );
    }, 10000);
    context.subscriptions.push({
      dispose() {
        clearInterval(interval);
      },
    });
  }
  globalHubManager.dispatcher.on("chat", (message) => {
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
