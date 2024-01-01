// SPDX-License-Identifier: MIT

interface Core {
  notice(msg: string): void;
}

interface Params {
  readonly core: Core;
}

function deprecationWarnings({
  core,
}: Params): void {
  core.notice(
    "Support for SVGO Action, in general, will end 2024-04-30. We recommend" +
    "finding an alternative before then and to stop using this Action.",
  );
}

export {
  deprecationWarnings,
};
