import type { error } from "../errors";
import type { SVGOptimizer } from "./types";
import type { SVGO as SVGOv1 } from "./v1/types";
import type { SVGO as SVGOv2 } from "./v2/types";

import importCwd from "import-cwd";

import errors from "../errors";
import StubSVGOptimizer from "./stub";
import svgoV1 from "./v1";
import svgoV2 from "./v2";
import svgoV3 from "./v3";

function isSvgoV2(importedSvgo: unknown): boolean {
  return Object.prototype.hasOwnProperty.call(
    importedSvgo,
    "extendDefaultPlugins",
  );
}

function isSvgoV3(importedSvgo: unknown): boolean {
  return Object.prototype.hasOwnProperty.call(
    importedSvgo,
    "loadConfig",
  );
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
    return svgoV2.NewFrom(svgo as SVGOv2, options);
  } else if (isSvgoV3(svgo)) {
    return svgoV3.NewFrom(svgo as SVGOv2, options);
  } else {
    return svgoV1.NewFrom(svgo as SVGOv1, options);
  }
}

export default createSvgoOptimizerForProject;
