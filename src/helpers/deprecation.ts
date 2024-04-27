// SPDX-License-Identifier: MIT

interface Core {
  error(msg: string): void;
}

interface Params {
  readonly core: Core;
}

function deprecationWarnings({
  core,
}: Params): void {
  core.error(
    "Support for SVGO Action ended 2024-04-30. We recommend finding an " +
    "alternative and to not start nor continue using this Action.",
  );
}

export {
  deprecationWarnings,
};
