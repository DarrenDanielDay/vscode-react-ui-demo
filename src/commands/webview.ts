import env from "@esbuild-env";

export const WebviewControll = {
  Open: `${env.EXTENSION_BASE_NAME}.open`,
  Close: `${env.EXTENSION_BASE_NAME}.close`,
  Reload: `${env.EXTENSION_BASE_NAME}.reload`,
} as const;
