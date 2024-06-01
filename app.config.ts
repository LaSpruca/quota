import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  let pkg = config.android!.package!;
  let name = config.name!;

  if (process.env.DEVELOPMENT) {
    pkg += ".dev";
    name += " Dev";
  }

  return {
    ...config,
    name,
    slug: config.slug!,

    android: {
      ...config.android,
      package: pkg,
    },
  };
};
