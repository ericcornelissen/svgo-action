import type { error, Inputter } from "../types";
import type { Config } from "./types";

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

function New({ inp }: Params): [Config, error] {
  const [ignoreGlob, err0] = getIgnoreGlob(inp, "");
  const [isDryRun, err1] = getIsDryRun(inp, false);
  const [svgoConfigPath, err2] = getSvgoConfigPath(inp, "svgo.config.js");
  const [svgoVersion, err3] = getSvgoVersion(inp, 2);

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
