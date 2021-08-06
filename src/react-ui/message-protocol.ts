// Define your protocol here, and implement them in `modules` with best practice!

export interface CoreAPI {
  logInput(input: string): string;
  setState(key: string, value: unknown): void;
  getState(key: string): unknown;
  vscode: typeof import("vscode");
}

export interface CoreEvents {
  chat: string;
}
