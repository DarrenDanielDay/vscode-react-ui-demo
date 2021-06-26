import env from "@esbuild-env";
import * as vscode from "vscode";
import type { CoreAPI } from "../react-ui/message-protocol";
import { Controller, Inject } from "./controller-decorator";

@Controller
export class CoreController implements CoreAPI {
  @Inject.singleton(() => vscode)
  vscode!: typeof vscode;
  @Inject.singleton(() => new Map<string, unknown>())
  private readonly stateMap!: Map<string, unknown>;
  setState(key: string, value: unknown): void {
    this.stateMap.set(key, value);
  }
  getState(key: string): unknown {
    return this.stateMap.get(key);
  }
  @Inject.singleton(() =>
    vscode.window.createOutputChannel(`${env.EXTENSION_BASE_NAME} Logger`)
  )
  private readonly channel!: vscode.OutputChannel;
  logInput(params: string): string {
    this.channel.appendLine(params);
    this.channel.show();
    return `The log <${params}> has been logged into OUTPUT "${env.EXTENSION_BASE_NAME} Logger". You can find them by "Ctrl + Shift + U" `;
  }
}
