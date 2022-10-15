interface Core {
  notice(msg: string): void;
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

  core.notice(
    "Support for SVGO Action v2 ended 2023-04-30. Please upgrade to the " +
    "latest version as soon as possible",
  );
}

export {
  deprecationWarnings,
};
