import { UIRequestController } from "../react-ui/message-protocol";
import * as vscode from "vscode";
import { Controller, Inject } from "./controller-decorator";

@Controller
export class DemoController implements UIRequestController {
  @Inject.singleTone(() =>
    vscode.window.createOutputChannel("vscode-react-ui-demo Logger")
  )
  private readonly channel!: vscode.OutputChannel;
  async logInput(params: string) {
    // Suppose sometimes methods of controller crashed:
    if (Math.random() < 0.5) {
      throw new Error("Sorry, crashed!");
    }
    this.channel.appendLine(params);
    return `The log <${params}> has been logged into OUTPUT "vscode-react-ui-demo Logger". You can find them by "Ctrl + Shift + U" `;
  }
}
