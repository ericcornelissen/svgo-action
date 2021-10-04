import type { error } from "../types";
import type { SupportedSvgoVersions, SVGOptimizer } from "./types";

import createSvgoOptimizerForProject from "./project";
import SVGOptimizerV1 from "./svgo-v1-wrapper";
import SVGOptimizerV2 from "./svgo-v2-wrapper";

interface Config {
  readonly svgoVersion: {
    readonly value: SupportedSvgoVersions | "project";
  };
}

interface Params {
  readonly config: Config;
  readonly svgoConfig?: unknown;
}

function New({
  config,
  svgoConfig,
}: Params): [SVGOptimizer, error] {
  let svgOptimizer: SVGOptimizer = {} as SVGOptimizer;
  let err: error = null;

  switch (config.svgoVersion.value) {
    case "project":
      [svgOptimizer, err] = createSvgoOptimizerForProject(svgoConfig);
      break;
    case 1:
      svgOptimizer = new SVGOptimizerV1(svgoConfig);
      break;
    case 2:
    default:
      svgOptimizer = new SVGOptimizerV2(svgoConfig);
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
