import type { error } from "../types";
import type { SVGOptimizer } from "./types";

import importCwd from "import-cwd";

import errors from "../errors";
import svgoV1 from "./v1";
import svgoV2 from "./v2";

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
    return svgoV2.New(options);
  } else {
    return svgoV1.New(options);
  }
}

export default createSvgoOptimizerForProject;
