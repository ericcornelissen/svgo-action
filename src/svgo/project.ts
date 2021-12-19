import type { error } from "../errors";
import type { SVGOptimizer } from "./types";

import importCwd from "import-cwd";

import errors from "../errors";
import StubSVGOptimizer from "./stub";
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
      StubSVGOptimizer,
      errors.New("package-local SVGO not found"),
    ];
  }

  if (isSvgoV2(svgo)) {
    return svgoV2.NewFrom(svgo, options);
  } else {
    return svgoV1.NewFrom(svgo, options);
  }
}

export default createSvgoOptimizerForProject;
