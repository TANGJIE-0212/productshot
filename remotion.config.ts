import { Config } from "@remotion/cli/config";
import path from "path";

Config.setEntryPoint("src/remotion/index.ts");
Config.overrideWebpackConfig((config) => ({
  ...config,
  resolve: {
    ...config.resolve,
    alias: {
      ...config.resolve?.alias,
      "@": path.resolve(process.cwd(), "src"),
    },
  },
}));
