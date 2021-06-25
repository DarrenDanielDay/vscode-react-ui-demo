import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import * as http from "http";
import env from "@esbuild-env";
import type { SnowpackDevServer } from "snowpack";
/**
 * Manage a single webview.
 */
export class WebviewManager implements vscode.Disposable {
  devServer?: SnowpackDevServer;
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
        retainContextWhenHidden: true,
        localResourceRoots: [vscode.Uri.file(path.join(context.extensionPath))],
      }
    );

    this.panel.onDidDispose((e) => {
      this.panel = undefined;
      this.detach();
    });
    this.reload(context);
  }

  reload(context: vscode.ExtensionContext) {
    if (!this.panel) {
      console.warn("Please open panel first!");
      return;
    }
    const webview = this.panel.webview;
    if (env.ENV === "prod") {
      webview.html = fs
        .readFileSync(
          path.join(
            context.extensionPath,
            ...env.STATIC_FILE_BASE_DIR_NAMES,
            "index.html"
          )
        )
        .toString("utf-8")
        .replace("%HASH%", +new Date() + "")
        .replace("./index.js", this.staticFileUrlString(context, "index.js"));
    } else {
      if (!this.devServer) {
        vscode.window.showWarningMessage(
          "Development Server is not ready currently"
        );
        return;
      }
      const { port } = this.devServer;
      const host = `http://localhost:${port}`;
      http.get(host, (res) => {
        const body: string[] = [];
        res.on("data", (chunk) => {
          body.push(chunk);
        });
        res.on("end", () => {
          webview.html = body
            .join("")
            .replace("./index.js", `${host}/index.js`)
            .replace("%HASH%", +new Date() + "")
            .replace(
              "<!-- SOCKET URL INJECTION DO NOT MODIFY -->",
              `<script>window.HMR_WEBSOCKET_URL="ws://localhost:${port}/"</script>`
            );
        });
      });
    }
  }

  private staticFileUrlString(
    context: vscode.ExtensionContext,
    ...paths: string[]
  ): string {
    return urlOfFile(
      this.panel!,
      context,
      path.join(...env.STATIC_FILE_BASE_DIR_NAMES, ...paths)
    );
  }

  close() {
    if (!this.panel) {
      return;
    }
    this.detach();
    this.panel.dispose();
    this.panel = undefined;
  }
  private attachResource?: vscode.Disposable;
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
      !!result && this.panel.webview.postMessage(result);
    };
    this.attachResource = this.panel.webview.onDidReceiveMessage(
      this.messageHandler
    );
    return this;
  }

  detach() {
    this.messageHandler = undefined;
    this.attachResource?.dispose();
  }

  dispose() {
    this.close();
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
