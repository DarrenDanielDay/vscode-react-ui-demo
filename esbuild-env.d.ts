// Custom env declaration of esbuild
declare module "@esbuild-env" {
  interface ESBuildEnv {
    ENV: "dev" | "prod";
    STATIC_FILE_BASE_DIR_NAMES: string[];
    EXTENSION_BASE_NAME: string;
  }
  const env: ESBuildEnv;
  export type { ESBuildEnv };
  export default env;
}
