interface Core {
  warning(msg: string): void;
}

interface Params {
  readonly core: Core;
}

function deprecationWarnings({
  core,
}: Params): void {
  core.warning(
    "Support for SVGO Action v3 ended 2023-12-31. Please upgrade to the " +
    "latest version as soon as possible",
  );
}

export {
  deprecationWarnings,
};
