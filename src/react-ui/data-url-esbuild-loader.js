// @ts-check

const pluginName = "data-url-esbuild-loader";
/** @type {import("snowpack").SnowpackPluginFactory<import('./data-url-esbuild-loader').DataUrlESBuildLoaderOptions>} */
const factory = (_, options) => {
  const { exts = [".jpg", ".png", ".svg"] } = options;
  if (
    !Array.isArray(exts) ||
    exts.some((ext) => typeof ext !== "string" || !ext.startsWith("."))
  ) {
    throw new Error(
      `[${pluginName}]: File extension names must be an array of strings starts with "."`
    );
  }
  return {
    name: pluginName,
    resolve: {
      input: exts,
      output: [".js"],
    },
    async load({ fileExt, filePath }) {
      const { build } = await import("esbuild");
      const { errors, warnings, outputFiles } = await build({
        entryPoints: [filePath],
        loader: {
          [fileExt]: "dataurl",
        },
        write: false,
        format: "esm",
      });
      if (warnings.length) {
        warnings.forEach((warning) => console.warn(warning));
      }
      if (errors.length) {
        errors.forEach((error) => console.error(error));
      }
      if (outputFiles.length !== 1) {
        throw new Error(`[${pluginName}]: ESBuild internal error occurred`);
      }
      const file = outputFiles[0];
      return {
        ".js": {
          code: Buffer.from(file.contents),
        },
      };
    },
  };
};

module.exports = factory;
