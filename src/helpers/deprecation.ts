import type { SupportedSvgoVersions } from "../svgo";
import type { Core } from "../types";

interface Config {
  readonly svgoVersion: {
    readonly value: SupportedSvgoVersions;
  };
}

interface Params {
  readonly config: Config;
  readonly core: Core;
}

function deprecationWarnings({
  config,
  core,
}: Params): void {
  if (config.svgoVersion.value === 1) {
    core.warning("This SVGO version is no longer supported. Upgrade to v2.x.x or higher");
  }
}

export {
  deprecationWarnings,
};
