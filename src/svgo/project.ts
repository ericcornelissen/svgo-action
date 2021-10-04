import type { error } from "../types";
import type { SVGOptimizer } from "./types";

import SVGOptimizerV2 from "./svgo-v2-wrapper";

function createSvgoOptimizerForProject(
  options: unknown = { },
): [SVGOptimizer, error] {
  return [new SVGOptimizerV2(options), null];
}

export default createSvgoOptimizerForProject;
