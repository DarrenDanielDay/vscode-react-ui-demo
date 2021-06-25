declare global {
  function acquireVsCodeApi(): { postMessage(params: Message<any>): any };
}

export {};
