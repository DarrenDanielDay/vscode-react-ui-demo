import * as vscode from "vscode";
import env from "@esbuild-env";
import { createWebviewManager, IWebviewManager } from "./webview-handler";
import { createModuleManager } from "./modules/module-manager";
import { Commands } from "./commands";
import { loadSnowpackConfig } from "./debug/snowpack-dev";
import { createCoreAPI } from "./modules/core-module";
import { createEventHubAdapter } from "./events/event-manager";
import type { CoreEvents } from "./app/message-protocol";
import { createMessageHandler } from "./messages/message-manager";

export function activate(context: vscode.ExtensionContext) {
  const globalModuleManager = createModuleManager(createCoreAPI());
  const globalEventHubAdapter = createEventHubAdapter<CoreEvents>();
  const globalMessageHandler = createMessageHandler({
    moduleManager: globalModuleManager,
    eventAdapter: globalEventHubAdapter,
  });
  const webviewManager = createWebviewManager(
    "ui",
    "Extension UI of React",
    context
  );
  context.subscriptions.push(webviewManager);
  context.subscriptions.push(globalEventHubAdapter);
  const { open: doOpen, reload, close } = webviewManager;
  const open = function (this: IWebviewManager) {
    doOpen.call(this);
    webviewManager.messageHandler ??
      webviewManager.attach(globalMessageHandler);
    globalEventHubAdapter.attach(webviewManager.panel!.webview);
  };
  if (env.ENV === "dev") {
    const interval = setInterval(() => {
      globalEventHubAdapter.dispatcher.emit(
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
  globalEventHubAdapter.dispatcher.on("chat", (message) => {
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
  // Do nothing
}
