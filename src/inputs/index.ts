// SPDX-License-Identifier: MIT

import type { Config, Inputter } from "./types";
import type { error } from "../errors";

import {
  DEFAULT_IGNORE_GLOBS,
  DEFAULT_IS_DRY_RUN,
  DEFAULT_IS_STRICT_MODE,
  DEFAULT_SVGO_VERSION,
} from "./constants";
import {
  getIgnoreGlobs,
  getIsDryRun,
  getIsStrictMode,
  getSvgoConfigPath,
  getSvgoVersion,
} from "./getters";
import {
  getDefaultSvgoConfigPath,
} from "./helpers";
import errors from "../errors";

interface Params {
  readonly inp: Inputter;
}

function New({ inp }: Params): [Config, error] {
  const [ignoreGlobs, err0] = getIgnoreGlobs(inp, DEFAULT_IGNORE_GLOBS);
  const [isDryRun, err1] = getIsDryRun(inp, DEFAULT_IS_DRY_RUN);
  const [isStrictMode, err2] = getIsStrictMode(inp, DEFAULT_IS_STRICT_MODE);
  const [svgoVersion, err3] = getSvgoVersion(inp, DEFAULT_SVGO_VERSION);

  const defaultSvgoConfigPath = getDefaultSvgoConfigPath(svgoVersion.value);
  const [svgoConfigPath, err4] = getSvgoConfigPath(inp, defaultSvgoConfigPath);

  return [
    {
      ignoreGlobs,
      isDryRun,
      isStrictMode,
      svgoConfigPath,
      svgoVersion,
    },
    errors.Combine(err0, err1, err2, err3, err4),
  ];
}

export default {
  New,
};

export type {
  Inputter,
};
