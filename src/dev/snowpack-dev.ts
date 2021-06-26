import * as vscode from "vscode";
import * as path from "path";
import env from "@esbuild-env";
import { Commands } from "../commands";
export async function startSnowpackDev(context: vscode.ExtensionContext) {
  const { loadConfiguration, startServer } = await import("snowpack");
  const root = path.resolve(context.extensionPath, "src", "react-ui");
  const configPath = path.resolve(
    context.extensionPath,
    "src",
    "react-ui",
    "snowpack.config.mjs"
  );
  const config = await loadConfiguration({ root }, configPath);
  const server = await startServer({ config });
  server.onFileChange(({ filePath }) => {
    if (
      path.resolve(filePath) ===
      path.resolve(
        context.extensionPath,
        ...env.STATIC_FILE_BASE_DIR_NAMES,
        "index.html"
      )
    ) {
      // Reload when index.html change.
      // Snowpack cannot reload vscode webview correctly.
      vscode.commands.executeCommand(Commands.WebviewControll.Reload);
    }
  });
  context.subscriptions.push({
    dispose() {
      server.shutdown();
    },
  });
  return server;
}
