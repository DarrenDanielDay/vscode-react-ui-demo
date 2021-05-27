// @ts-check
/// <reference path="esbuild-env.d.ts" />
import esbuild from "esbuild";
import path from "path";

//#region Environment variables
/** @type {import('@esbuild-env').ESBuildEnv} */
const devEnv = {
  ENV: "dev",
  STATIC_FILE_BASE_DIR_NAMES: ["src", "react-ui", "dist"],
};
/** @type {import("@esbuild-env").ESBuildEnv} */
const prodEnv = {
  ENV: "prod",
  STATIC_FILE_BASE_DIR_NAMES: ["out", "ui"],
};
//#endregion

const isDev = process.argv.includes("--dev");

//#region Extension build options
/** @type {esbuild.BuildOptions} */
const extensionCommonBuildOptions = {
  platform: "node",
  entryPoints: [path.resolve("src", "extension.ts")],
  external: ["vscode"],
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

if (isDev) {
  esbuild.build({
    ...extensionCommonBuildOptions,
    sourcemap: "both",
  });
} else {
  esbuild.build({
    ...extensionCommonBuildOptions,
    minify: true,
    treeShaking: true,
  });
}
