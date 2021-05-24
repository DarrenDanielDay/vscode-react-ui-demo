import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

export class WebviewManager {
  panel: vscode.WebviewPanel | undefined;
  public messageHandler?: Parameters<vscode.Webview["onDidReceiveMessage"]>[0];
  open(context: vscode.ExtensionContext) {
    if (this.panel) {
      return;
    }
    this.panel = vscode.window.createWebviewPanel(
      "react-ui",
      "Extension UI by React",
      vscode.ViewColumn.One,
      {
        enableScripts: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))],
      }
    );

    this.panel.onDidDispose((e) => {
      this.panel = undefined;
    });
    this.reload(context);
  }

  reload(context: vscode.ExtensionContext) {
    if (!this.panel) {
      console.warn("Please open panel first!");
      return;
    }
    // TODO Use webpack to make it easier.
    this.panel.webview.html = fs
      .readFileSync(
        path.join(context.extensionPath, "src\\react-ui\\index.html")
      )
      .toString("utf-8")
      .replace("%HASH%", +new Date() + "")
      .replace(
        "%INDEX_JS%",
        urlOfFile(this.panel, context, "src\\react-ui\\dist\\index.js")
      )
      .replace(
        "%APP_CSS%",
        urlOfFile(this.panel, context, "src\\react-ui\\src\\app.css")
      );
  }
  close() {
    if (!this.panel) {
      return;
    }
    this.panel.dispose();
    this.panel = undefined;
  }

  attach(messageHandler: Parameters<vscode.Webview["onDidReceiveMessage"]>[0]) {
    if (this.messageHandler) {
      throw new Error("Cannot attach handler more than once!");
    }
    if (!this.panel) {
      throw new Error("Please open webview first!");
    }
    this.messageHandler = async (e) => {
      if (!this.panel) {
        return;
      }
      const result = await messageHandler(e);
      this.panel.webview.postMessage(result);
    };
    this.panel.webview.onDidReceiveMessage(this.messageHandler);
    return this;
  }
}

function urlOfFile(
  panel: vscode.WebviewPanel,
  context: vscode.ExtensionContext,
  relativePathToExtensionProject: string
): string {
  return panel.webview
    .asWebviewUri(
      vscode.Uri.file(
        path.join(context.extensionPath, relativePathToExtensionProject)
      )
    )
    .toString();
}
