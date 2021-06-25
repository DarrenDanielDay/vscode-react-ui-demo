import * as vscode from "vscode";
import env from "@esbuild-env";
import { MessageManager } from "./message/message-manager";
import { WebviewManager } from "./react-ui/extension-handler";
import { Inject } from "./controller/controller-decorator";
import "./controller";
import { HubManager } from "./hubs/hub-manager";
import { Commands } from "./commands";
import { startSnowpackDev } from "./dev/snowpack-dev";

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
    startSnowpackDev(context).then((server) => {
      webviewManager.devServer = server;
      console.log("Successfully built React UI resources");
      vscode.commands.executeCommand(Commands.WebviewControll.Open).then(() => {
        console.log("Successfully opened webview");
      });
    });
  }
}

export function deactivate() {
  Inject.context = undefined;
}
