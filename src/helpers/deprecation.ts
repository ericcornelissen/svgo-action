interface Core {
  warning(msg: string): void;
}

interface Config {
  readonly svgoVersion: {
    readonly value: string;
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
  if (config.svgoVersion.value === "1") {
    core.warning("This SVGO version is no longer supported. Upgrade to v2.x.x or higher");
  }
}

export {
  deprecationWarnings,
};
