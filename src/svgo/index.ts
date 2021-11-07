import type { error } from "../types";
import type { SupportedSvgoVersions, SVGOptimizer } from "./types";

import createSvgoForVersion from "./custom";
import createSvgoOptimizerForProject from "./project";
import svgoV1 from "./v1";
import svgoV2 from "./v2";

interface Config {
  readonly svgoVersion: {
    readonly value: SupportedSvgoVersions;
  };
}

interface Core {
  getState(key: string): string;
}

interface Params {
  readonly config: Config;
  readonly core: Core;
  readonly svgoConfig: unknown;
}

function New({
  config,
  core,
  svgoConfig,
}: Params): [SVGOptimizer, error] {
  let svgOptimizer = {} as SVGOptimizer;
  let err: error = null;

  switch (config.svgoVersion.value) {
  case "project":
    [svgOptimizer, err] = createSvgoOptimizerForProject(svgoConfig);
    break;
  case "1":
    [svgOptimizer, err] = svgoV1.New(svgoConfig);
    break;
  case "2":
    [svgOptimizer, err] = svgoV2.New(svgoConfig);
    break;
  default:
    [svgOptimizer, err] = createSvgoForVersion(core, svgoConfig);
    break;
  }

  return [svgOptimizer, err];
}

export default {
  New,
};

export type {
  SupportedSvgoVersions,
  SVGOptimizer,
};
