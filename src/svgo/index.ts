import type { error } from "../errors";
import type { Logger, SupportedSvgoVersions, SVGOptimizer } from "./types";

import createSvgoOptimizerForProject from "./project";
import StubSVGOptimizer from "./stub";
import svgoV2 from "./v2";
import svgoV3 from "./v3";

interface Config {
  readonly svgoVersion: {
    readonly value: SupportedSvgoVersions;
  };
}

interface Params {
  readonly config: Config;
  readonly log: Logger;
  readonly svgoConfig: unknown;
}

function New({
  config,
  log,
  svgoConfig,
}: Params): [SVGOptimizer, error] {
  const svgoVersion = config.svgoVersion.value;

  let svgOptimizer: SVGOptimizer = StubSVGOptimizer;
  let err: error = null;

  switch (svgoVersion) {
  case "project":
    [svgOptimizer, err] = createSvgoOptimizerForProject(svgoConfig, log);
    break;
  case "2":
    [svgOptimizer, err] = svgoV2.New(svgoConfig);
    break;
  case "3":
    [svgOptimizer, err] = svgoV3.New(svgoConfig);
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
