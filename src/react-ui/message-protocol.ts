// Define your protocol here, and implement them in `controllers` with best practice!

export interface CoreAPI {
  logInput(input: string): string;
  setState(key: string, value: unknown): void;
  getState(key: string): unknown;
}

export interface CoreHubEvents {
  chat: string;
}
