import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => {
  let pkg = config.android!.package!;
  if (process.env.DEVELOPMENT) {
    pkg += ".dev";
  }

  return {
    ...config,
    name: config.name!,
    slug: config.slug!,

    android: {
      ...config.android,
      package: pkg,
    },
  };
};
