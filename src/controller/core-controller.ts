import * as vscode from "vscode";
import { CoreAPI } from "../react-ui/message-protocol";
import { Controller, Inject } from "./controller-decorator";

@Controller
export class DemoController implements CoreAPI {
  @Inject.singleton(() => new Map<string, unknown>())
  private readonly stateMap!: Map<string, unknown>;
  setState(key: string, value: unknown): void {
    this.stateMap.set(key, value);
  }
  getState(key: string): unknown {
    return this.stateMap.get(key);
  }
  @Inject.singleton(() =>
    vscode.window.createOutputChannel("vscode-react-ui-demo Logger")
  )
  private readonly channel!: vscode.OutputChannel;
  logInput(params: string): string {
    this.channel.appendLine(params);
    return `The log <${params}> has been logged into OUTPUT "vscode-react-ui-demo Logger". You can find them by "Ctrl + Shift + U" `;
  }
}
