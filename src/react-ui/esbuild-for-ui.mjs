// @ts-check
import esbuild from "esbuild";
import path from "path";
import fs from "fs";
import util from "util";
import { minify } from "terser";
const isDev = process.argv.includes("--dev");
let readyState = false;
let reactUIFolder = isDev
  ? path.resolve(process.cwd())
  : path.resolve(process.cwd(), "src", "react-ui");
let dist = isDev
  ? path.resolve(process.cwd(), "dist")
  : path.resolve(process.cwd(), "out", "ui");
//#region UI build configs
/** @type {esbuild.BuildOptions} */
const options = {
  platform: "browser",
  absWorkingDir: reactUIFolder,
  bundle: true,
  format: "esm",
  splitting: isDev,
  sourcemap: isDev,
  tsconfig: "./tsconfig.json",
  entryPoints: ["./src/index.tsx"],
  outdir: dist,
  loader: {
    ".svg": "dataurl",
  },
  minify: !isDev,
  treeShaking: isDev ? undefined : true,
  watch: !isDev
    ? undefined
    : {
        onRebuild() {
          trackMessage("Rebuild");
        },
      },
  plugins: [
    {
      name: "copy static file",
      setup(builder) {
        builder.onEnd(async (result) => {
          await copyStatic();
          if (!readyState) {
            readyState = true;
            trackMessage("Ready");
          }
          trackMessage("Copied static file");
        });
      },
    },
  ],
};
esbuild
  .build(options)
  .then(async () => {
    const read = util.promisify(fs.readFile);
    const write = util.promisify(fs.writeFile);
    const bundle = path.resolve(options.outdir ?? "", "index.js");
    const content = (await read(bundle)).toString("utf-8");
    const minified = await minify(content, { ecma: 2015 });
    await write(bundle, minified.code ?? "");
    console.log("terser minify finished");
  })
  .catch(console.error);
//#endregion
/**
 * Copy static files
 */
async function copyStatic() {
  const copy = util.promisify(fs.copyFile);
  const readdir = util.promisify(fs.readdir);
  const stat = util.promisify(fs.stat);
  const mkdir = util.promisify(fs.mkdir);
  const staticFolder = path.join(reactUIFolder, "static");
  try {
    if (!(await stat(dist)).isDirectory()) {
      throw new Error();
    }
  } catch (error) {
    await mkdir(dist, { recursive: true });
  }
  const files = await readdir(staticFolder);
  await Promise.all(
    files.map((file) =>
      copy(path.join(staticFolder, file), path.join(dist, file))
    )
  );
}
/**
 * Track message for build infomation
 * @param message {string}
 */
function trackMessage(message) {
  if (typeof process.send === "function") {
    process.send(message);
  } else {
    console.log(message);
  }
}
