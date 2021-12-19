import type { error } from "../errors";
import type { SupportedSvgoVersions, SVGOptimizer } from "./types";

import errors from "../errors";
import createSvgoOptimizerForProject from "./project";
import StubSVGOptimizer from "./stub";
import svgoV1 from "./v1";
import svgoV2 from "./v2";

interface Config {
  readonly svgoVersion: {
    readonly value: SupportedSvgoVersions;
  };
}

interface Params {
  readonly config: Config;
  readonly svgoConfig: unknown;
}

function New({
  config,
  svgoConfig,
}: Params): [SVGOptimizer, error] {
  const svgoVersion = config.svgoVersion.value;

  let svgOptimizer: SVGOptimizer = StubSVGOptimizer;
  let err: error = null;

  switch (svgoVersion) {
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
    err = errors.New(`unknown value '${svgoVersion}'`);
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
