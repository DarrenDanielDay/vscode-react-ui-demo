// @ts-check
import esbuild from "esbuild";
import path from "path";
import fs from "fs";
import util from "util";
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
esbuild.build(options);
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
