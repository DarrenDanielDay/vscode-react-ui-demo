// @ts-check
import { spawn } from "child_process";
import { platform } from "os";
import { resolve } from "path";
import { startServer, loadConfiguration } from "snowpack";
const yarn = platform() === "win32" ? "yarn.cmd" : "yarn";
const projectRoot = resolve(process.cwd(), "..", "..");
(async () => {
  const esbuildProcess = spawn(yarn, ["watch:esbuild"], {
    cwd: projectRoot,
  });
  esbuildProcess.stdout.pipe(process.stdout);
  const config = await loadConfiguration({});
  await startServer({ config });
  const extensionTypesProcess = spawn(yarn, ["watch:types"], {
    cwd: projectRoot,
  });
  extensionTypesProcess.stdout.pipe(process.stdout);
  const uiTypesWatchProcess = spawn(yarn, ["watch:types"]);
  uiTypesWatchProcess.stdout.pipe(process.stdout);
})();
