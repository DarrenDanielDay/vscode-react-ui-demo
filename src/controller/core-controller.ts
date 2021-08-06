import env from "@esbuild-env";
import * as vscode from "vscode";
import type { CoreAPI } from "../react-ui/message-protocol";
import { Inject } from "./controller-decorator";

interface CoreAPIMixin {
  readonly stateMap: Map<string, unknown>;
  readonly channel: vscode.OutputChannel;
}

const mixin = {};
Inject.singleton(() => new Map<string, unknown>())(mixin, "stateMap");
Inject.singleton(() =>
  vscode.window.createOutputChannel(`${env.EXTENSION_BASE_NAME} Logger`)
)(mixin, "channel");
// @ts-expect-error Just function, not constructor
const createCoreAPI: { (): CoreAPI; new (): CoreAPI } = function (): CoreAPI {
  const coreApi = {
    vscode,
    setState(key: string, value: unknown): void {
      impl.stateMap.set(key, value);
    },
    getState(key: string): unknown {
      return impl.stateMap.get(key);
    },
    logInput(params: string): string {
      impl.channel.appendLine(params);
      impl.channel.show();
      return `The log <${params}> has been logged into OUTPUT "${env.EXTENSION_BASE_NAME} Logger". You can find them by "Ctrl + Shift + U" `;
    },
  };
  const impl: CoreAPI & CoreAPIMixin = Object.setPrototypeOf(coreApi, mixin);
  return impl;
};

export { createCoreAPI };
