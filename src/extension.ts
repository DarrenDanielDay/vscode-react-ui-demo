import * as vscode from "vscode";
import { ControllerManager } from "./controller/controller-decorator";
import { WebviewManager } from "./react-ui/extension-handler";
import "./controller";

export function activate(context: vscode.ExtensionContext) {
  const webviewManager = new WebviewManager();
  const { open, reload, close } = webviewManager;
  [open, reload, close].forEach((command) => {
    const disposable = vscode.commands.registerCommand(
      `vscode-react-ui-demo.${command.name}`,
      command.bind(webviewManager, context)
    );
    context.subscriptions.push(disposable);
  });
  setImmediate(() => {
    webviewManager.open(context);
    webviewManager.attach(ControllerManager.instance.messageHandler);
  });
}

export function deactivate() {}
