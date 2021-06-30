import * as vscode from "vscode";
import env from "@esbuild-env";
import { WebviewManager } from "./webview-handler";
import { Commands } from "./commands";
import { loadSnowpackConfig } from "./dev/snowpack-dev";

export function activate(context: vscode.ExtensionContext) {
  const webviewManager = new WebviewManager(context);
  context.subscriptions.push(webviewManager);
  const { open, reload, close } = webviewManager;
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
  // DO nothing
}
