import type * as vscode from "vscode";
import * as path from "path";
export async function loadSnowpackConfig(context: vscode.ExtensionContext) {
  const { loadConfiguration } = await import("snowpack");
  const root = path.resolve(context.extensionPath, "src", "app");
  const configPath = path.resolve(
    context.extensionPath,
    "src",
    "app",
    "snowpack.config.mjs"
  );
  return loadConfiguration({ root }, configPath);
}
