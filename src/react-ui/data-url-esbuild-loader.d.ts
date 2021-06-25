import type { SnowpackPluginFactory } from "snowpack";

export interface DataUrlESBuildLoaderOptions {
  exts?: string[];
}

const factory: SnowpackPluginFactory<DataUrlESBuildLoaderOptions>;
export default factory;
