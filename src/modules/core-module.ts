import env from "@esbuild-env";
import * as vscode from "vscode";
import type { CoreAPI } from "../app/message-protocol";

interface CoreAPIMixin {
  readonly stateMap: Map<string, unknown>;
  readonly channel: vscode.OutputChannel;
}
const mixin: CoreAPIMixin = {
  stateMap: new Map<string, unknown>(),
  channel: vscode.window.createOutputChannel(
    `${env.EXTENSION_BASE_NAME} Logger`
  ),
};

function createCoreAPI(): CoreAPI {
  const coreApi: CoreAPI = {
    vscode,
    setState(key: string, value: unknown): void {
      mixin.stateMap.set(key, value);
    },
    getState(key: string): unknown {
      return mixin.stateMap.get(key);
    },
    logInput(params: string): string {
      mixin.channel.appendLine(params);
      mixin.channel.show();
      return `The log <${params}> has been logged into OUTPUT "${env.EXTENSION_BASE_NAME} Logger". You can find them by "Ctrl + Shift + U" `;
    },
  };
  return coreApi;
}
createCoreAPI.prototype.x = 1;

export { createCoreAPI };
