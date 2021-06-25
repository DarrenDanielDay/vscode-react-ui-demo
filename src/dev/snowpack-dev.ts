import type * as vscode from "vscode";
import * as path from "path";
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
  context.subscriptions.push({
    dispose() {
      server.shutdown();
    },
  });
  return server;
}
