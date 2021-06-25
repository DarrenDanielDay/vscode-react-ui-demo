// @ts-check
// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration
/** @type {import("snowpack").SnowpackUserConfig } */
const config = {
  mount: {
    src: { url: "/" },
  },
  plugins: ["@snowpack/plugin-react-refresh", "./data-url-esbuild-loader"],
  packageOptions: {
    /* ... */
  },
  optimize: {
    sourcemap: "both",
  },
  devOptions: {
    open: "none",
    output: "stream",
    hmr: true,
  },
  buildOptions: {
    out: "../../out/ui",
  },
};

export default config;
