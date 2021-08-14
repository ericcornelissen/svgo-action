import type { error, Inputter } from "../types";
import type { Config } from "./types";

import {
  DEFAULT_IGNORE_GLOB,
  DEFAULT_IS_DRY_RUN,
  DEFAULT_SVGO_V1_CONFIG_PATH,
  DEFAULT_SVGO_V2_CONFIG_PATH,
  DEFAULT_SVGO_VERSION,
} from "../constants";
import errors from "../errors";
import {
  getIgnoreGlob,
  getIsDryRun,
  getSvgoConfigPath,
  getSvgoVersion,
} from "./getters";

interface Params {
  readonly inp: Inputter;
}

function getDefaultSvgoConfigPath(svgoVersion: number): string {
  if (svgoVersion === 1) {
    return DEFAULT_SVGO_V1_CONFIG_PATH;
  }

  return DEFAULT_SVGO_V2_CONFIG_PATH;
}

function New({ inp }: Params): [Config, error] {
  const [ignoreGlob, err0] = getIgnoreGlob(inp, DEFAULT_IGNORE_GLOB);
  const [isDryRun, err1] = getIsDryRun(inp, DEFAULT_IS_DRY_RUN);
  const [svgoVersion, err3] = getSvgoVersion(inp, DEFAULT_SVGO_VERSION);

  const defaultSvgoConfigPath = getDefaultSvgoConfigPath(svgoVersion);
  const [svgoConfigPath, err2] = getSvgoConfigPath(inp, defaultSvgoConfigPath);

  return [
    {
      ignoreGlob,
      isDryRun,
      svgoConfigPath,
      svgoVersion,
    },
    errors.Combine(err0, err1, err2, err3),
  ];
}

export default {
  New,
};

export type {
  Config,
};
