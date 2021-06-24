// @ts-check
/// <reference path="esbuild-env.d.ts" />
import esbuild from "esbuild";
import { minify } from "terser";
import path from "path";
import util from "util";
import fs from "fs";
//#region Environment variables
/** @type {import('@esbuild-env').ESBuildEnv} */
const devEnv = {
  ENV: "dev",
  STATIC_FILE_BASE_DIR_NAMES: ["src", "react-ui", "dist"],
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
  esbuild
    .build({
      ...extensionCommonBuildOptions,
      minify: true,
      treeShaking: true,
    })
    .then(async () => {
      const read = util.promisify(fs.readFile);
      const write = util.promisify(fs.writeFile);
      const bundle = path.resolve(
        extensionCommonBuildOptions.outdir ?? "",
        "extension.js"
      );
      const content = (await read(bundle)).toString("utf-8");
      const minified = await minify(content, { ecma: 2015 });
      await write(bundle, minified.code ?? "");
      console.log("terser minify finished");
    })
    .catch(console.error);
}
