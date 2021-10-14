import type { error } from "../types";
import type { SVGOptimizer } from "./types";

import importCwd from "import-cwd";

import SVGOptimizerV2 from "./svgo-v2-wrapper";
import SVGOptimizerV1 from "./svgo-v1-wrapper";
import errors from "../errors";

function isSvgoV2(importedSvgo: unknown): boolean {
  return Object.prototype.hasOwnProperty.call(importedSvgo, "optimize");
}

function createSvgoOptimizerForProject(
  options: unknown = { },
): [SVGOptimizer, error] {
  const svgo = importCwd.silent("svgo");
  if (svgo === undefined) {
    return [
      null as unknown as SVGOptimizer,
      errors.New("package-local SVGO not found"),
    ];
  }

  // TODO: replace built-in SVGOptimizer instances with package-local one
  if (isSvgoV2(svgo)) {
    return [new SVGOptimizerV2(options), null];
  } else {
    return [new SVGOptimizerV1(options), null];
  }
}

export default createSvgoOptimizerForProject;
