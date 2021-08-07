declare global {
  interface WebviewInjectedVSCodeAPI {
    readonly postMessage: (params: unknown) => unknown;
    readonly setState: (state: unknown) => void;
    readonly getState: () => unknown;
  }

  function acquireVsCodeApi(): WebviewInjectedVSCodeAPI;
  var vscodeAPI: WebviewInjectedVSCodeAPI;
}

export {};
