// @ts-check
/// <reference path="esbuild-env.d.ts" />
import esbuild from "esbuild";
import path from "path";
//#region Environment variables
/** @type {import('@esbuild-env').ESBuildEnv} */
const devEnv = {
  ENV: "dev",
  STATIC_FILE_BASE_DIR_NAMES: ["src", "react-ui", "src"],
  EXTENSION_BASE_NAME: "vscode-react-ui-demo",
};
/** @type {import("@esbuild-env").ESBuildEnv} */
const prodEnv = {
  ENV: "prod",
  STATIC_FILE_BASE_DIR_NAMES: ["out", "ui"],
  EXTENSION_BASE_NAME: "vscode-react-ui-demo",
};
//#endregion

const isDev = process.argv.includes("--dev");

//#region Extension build options
/** @type {esbuild.BuildOptions} */
const extensionCommonBuildOptions = {
  platform: "node",
  entryPoints: [path.resolve("src", "extension.ts")],
  external: ["vscode", "snowpack", "esbuild"],
  outdir: path.resolve("out"),
  plugins: [
    {
      name: "extension-env-resolver",
      setup(builder) {
        builder.onResolve({ filter: /@esbuild-env/ }, () => {
          return {
            path: "@esbuild-env",
            namespace: "@esbuild-env",
          };
        });
        builder.onLoad({ filter: /@esbuild-env/ }, () => {
          return {
            contents: JSON.stringify(isDev ? devEnv : prodEnv),
            loader: "json",
          };
        });
      },
    },
  ],
  bundle: true,
};
//#endregion
/**
 * Trace build message.
 * @param message {Pick<import("esbuild").BuildFailure, "errors" | "warnings">}
 * @param method {(...args: any[]) => void}
 */
function trackMessage(message, method) {
  const date = new Date();
  const timeData = [date.getHours(), date.getMinutes(), date.getSeconds()];
  const prefix = `[${timeData
    .map((time) => (time + "").padEnd(2, "0"))
    .join(":")}] [esbuild]`;
  method(`${prefix} Extension code rebuild!`);
  for (const warning of message.warnings) {
    const {
      location: { file, line, column, suggestion },
      text,
    } = warning;
    method(`${prefix} ${file}(${line}:${column})`);
    text && method(`${prefix} ${text}`);
    suggestion && method(`${prefix} ${suggestion}`);
  }
  for (const warning of message.errors) {
    const {
      location: { file, line, column, suggestion },
      text,
    } = warning;
    method(`${prefix} ${file}(${line}:${column})`);
    text && method(`${prefix} ${text}`);
    suggestion && method(`${prefix} ${suggestion}`);
  }
}
if (isDev) {
  esbuild.build({
    ...extensionCommonBuildOptions,
    sourcemap: "both",
    watch: {
      onRebuild(error, result) {
        if (error) trackMessage(error, console.error);
        else trackMessage(result, console.log);
      },
    },
  });
} else {
  esbuild
    .build({
      ...extensionCommonBuildOptions,
      minify: true,
      treeShaking: true,
    })
    .catch(console.error);
}
