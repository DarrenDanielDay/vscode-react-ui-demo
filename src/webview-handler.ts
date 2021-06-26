import * as vscode from "vscode";
import * as fs from "fs/promises";
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
  constructor(public readonly context: vscode.ExtensionContext) {}
  open() {
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
        localResourceRoots: [
          vscode.Uri.file(path.join(this.context.extensionPath)),
        ],
      }
    );

    this.panel.onDidDispose((e) => {
      this.panel = undefined;
      this.detach();
    });
    this.reload();
  }

  async reload() {
    if (!this.panel) {
      console.warn("Please open panel first!");
      return;
    }
    let html: string;
    let baseUrl: string;
    if (env.ENV === "prod") {
      baseUrl = this.staticFileUrlString("index.js").replace(/\/index.js$/, "");
      const buffer = await fs.readFile(
        path.join(
          this.context.extensionPath,
          ...env.STATIC_FILE_BASE_DIR_NAMES,
          "index.html"
        )
      );
      html = buffer.toString("utf-8");
    } else {
      if (!this.devServer) {
        vscode.window.showWarningMessage(
          "Development Server is not ready currently"
        );
        return;
      }
      const { port } = this.devServer;
      baseUrl = `http://localhost:${port}`;
      html = await new Promise((resolve, reject) => {
        http.get(baseUrl, (res) => {
          const body: Buffer[] = [];
          res.on("data", (chunk) => {
            body.push(chunk);
          });
          res.on("end", () => {
            resolve(
              body
                .map((buffer) => buffer.toString("utf-8"))
                .join("")
                .replace(
                  "<!-- SOCKET URL INJECTION DO NOT MODIFY -->",
                  `<script>window.HMR_WEBSOCKET_URL="ws://localhost:${port}/"</script>`
                )
            );
          });
        });
      });
    }
    html = this.processUrlOfHtml(html, baseUrl);
    // A <meta> element with hash is designed to ensure the webview to reload.
    html = this.processHashOfHtml(html);
    this.panel.webview.html = html;
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
    this.attachResource = undefined;
  }

  dispose() {
    this.close();
  }

  private processUrlOfHtml(html: string, baseUrl: string): string {
    return html.replace(
      /((?:src)|(?:href))=('|")(.*?)\2/g,
      (substr, attr: string, _quote, urlPath: string) => {
        try {
          // Test if the url is supported by vscode
          vscode.Uri.parse(urlPath, true);
        } catch {
          const fullUrl = urlPath.startsWith("/")
            ? `${baseUrl}${urlPath}`
            : `${baseUrl}${urlPath.replace(/^\./, "")}`;
          return `${attr}="${fullUrl}"`;
        }
        // If the url appear to be a valid uri with scheme or cannot be handled, no replacement are performed.
        return substr;
      }
    );
  }

  private processHashOfHtml(html: string): string {
    return html.replace("%HASH%", +new Date() + "");
  }

  private staticFileUrlString(...paths: string[]): string {
    return urlOfFile(
      this.panel!,
      this.context,
      path.join(...env.STATIC_FILE_BASE_DIR_NAMES, ...paths)
    );
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
