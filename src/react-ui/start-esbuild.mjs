// @ts-check
import esbuild from "esbuild";

esbuild.build({
  platform: "browser",
  bundle: true,
  format: "esm",
  splitting: true,
  sourcemap: true,
  tsconfig: "./tsconfig.json",
  entryPoints: ["./src/index.tsx"],
  outdir: "dist",
  watch: {
    onRebuild() {
      const message = "Rebuild";
      if (typeof process.send === "function") {
        process.send(message);
      } else {
        console.log(message);
      }
    },
  },
});
