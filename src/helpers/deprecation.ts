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
    "General support for SVGO Action v3 ended 2023-09-23. Security " +
    "updates will be supported until 2023-12-31. Please upgrade to SVGO " +
    "Action v4 as soon as possible.",
  );
}

export {
  deprecationWarnings,
};
