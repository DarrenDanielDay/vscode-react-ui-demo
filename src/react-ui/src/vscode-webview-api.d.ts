declare global {
  interface WebviewInjectedVSCodeAPI {
    readonly postMessage: (params: any) => any;
    readonly setState: (state: any) => void;
    readonly getState: () => any;
  }

  function acquireVsCodeApi(): WebviewInjectedVSCodeAPI;
  var vscodeAPI: WebviewInjectedVSCodeAPI;
}

export {};
