import * as vscode from "vscode";
import * as fs from "fs/promises";
import * as path from "path";
import * as http from "http";
import env from "@esbuild-env";
import { json } from "./app/src/json-serializer";
type OnDidReceiveMessageHandler = Parameters<
  vscode.Webview["onDidReceiveMessage"]
>[0];
interface DevServerConfig {
  port: number;
  hmrSocketPort?: number;
}

/**
 * Manage a single webview.
 */
export interface IWebviewManager extends vscode.Disposable {
  devServerConfig?: DevServerConfig;
  readonly context: vscode.ExtensionContext;
  panel?: vscode.WebviewPanel;
  messageHandler?: OnDidReceiveMessageHandler;
  open: () => Promise<void>;
  reload: () => Promise<void>;
  close: () => void;
  attach: (handler: OnDidReceiveMessageHandler) => IWebviewManager;
  detach: () => void;
}

export function createWebviewManager(
  viewType: string,
  title: string,
  context: vscode.ExtensionContext
): IWebviewManager {
  let attachResource: vscode.Disposable | undefined = undefined;
  let panel: vscode.WebviewPanel | undefined = undefined;
  let messageHandler: OnDidReceiveMessageHandler | undefined = undefined;
  let devServerConfig: DevServerConfig | undefined = undefined;
  function processUrlOfHtml(html: string, baseUrl: string): string {
    return html.replace("%BASE_URL%", baseUrl);
  }
  function processHashOfHtml(html: string): string {
    return html.replace("%HASH%", new Date().getTime().toString());
  }
  function staticFileUrlString(
    panel: vscode.WebviewPanel,
    ...paths: string[]
  ): string {
    return urlOfFile(
      panel,
      context,
      path.join(...env.STATIC_FILE_BASE_DIR_NAMES, ...paths)
    );
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
  async function open() {
    if (!panel) {
      panel = vscode.window.createWebviewPanel(
        viewType,
        title,
        vscode.ViewColumn.One,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
          localResourceRoots: [
            vscode.Uri.file(path.join(context.extensionPath)),
          ],
        }
      );

      panel.onDidDispose((e) => {
        panel = undefined;
        detach();
      });
      await reload();
    }
    panel.reveal();
  }
  async function reload() {
    if (!panel) {
      console.warn("Please open panel first!");
      return;
    }
    let html: string;
    let baseUrl: string;
    if (env.ENV === "prod") {
      baseUrl = staticFileUrlString(panel, "index.js").replace(/index.js$/, "");
      const buffer = await fs.readFile(
        path.join(
          context.extensionPath,
          ...env.STATIC_FILE_BASE_DIR_NAMES,
          "index.html"
        )
      );
      html = buffer.toString("utf-8");
    } else {
      if (!devServerConfig) {
        vscode.window.showWarningMessage(
          "Development Server is not ready currently"
        );
        return;
      }
      const { port, hmrSocketPort } = devServerConfig;
      baseUrl = `http://localhost:${port}`;
      html = await new Promise((resolve, reject) => {
        http.get(baseUrl, (res) => {
          const body: Buffer[] = [];
          res.on("data", (chunk: Buffer) => {
            body.push(chunk);
          });
          res.on("end", () => {
            const resbonseBody = body
              .map((buffer) => buffer.toString("utf-8"))
              .join("");
            if (hmrSocketPort) {
              // Snowpack's HMR socket is calculated with `location.hostname` by default.
              // This is incorrect in vscode's webview.
              const withHmrSocketUrl = resbonseBody.replace(
                "<!-- HMR SOCKET URL INJECTION DO NOT MODIFY -->",
                `<script>window.HMR_WEBSOCKET_URL="ws://localhost:${hmrSocketPort}/"</script>`
              );
              resolve(withHmrSocketUrl);
            } else {
              resolve(resbonseBody);
            }
          });
        });
      });
    }
    // A <base> element with correct base url.
    html = processUrlOfHtml(html, baseUrl);
    // A <meta> element with hash is designed to ensure the webview to reload.
    html = processHashOfHtml(html);
    panel.webview.html = html;
  }
  function close() {
    if (!panel) {
      return;
    }
    detach();
    panel.dispose();
    panel = undefined;
  }
  function attach(handler: OnDidReceiveMessageHandler) {
    if (messageHandler) {
      throw new Error("Cannot attach handler more than once!");
    }
    if (!panel) {
      throw new Error("Please open webview first!");
    }
    messageHandler = async (e) => {
      if (!panel) {
        return;
      }
      const result: unknown = await handler(json.parse(e));
      !!result && panel.webview.postMessage(json.serialize(result));
    };
    attachResource = panel.webview.onDidReceiveMessage(messageHandler);
    return instance;
  }
  function detach() {
    messageHandler = undefined;
    attachResource?.dispose();
    attachResource = undefined;
  }
  const instance: IWebviewManager = {
    get context() {
      return context;
    },
    get devServerConfig() {
      return devServerConfig;
    },
    set devServerConfig(value) {
      devServerConfig = value;
    },
    get messageHandler() {
      return messageHandler;
    },
    get panel() {
      return panel;
    },
    dispose() {
      close();
      devServerConfig = undefined;
    },
    open,
    close,
    reload,
    attach,
    detach,
  };
  return instance;
}
