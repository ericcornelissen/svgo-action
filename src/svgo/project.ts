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

function isSvgoV2(importedSvgo: object): boolean {
  return Object.hasOwn(
    importedSvgo,
    "extendDefaultPlugins",
  );
}

function isSvgoV3(importedSvgo: object): boolean {
  return Object.hasOwn(
    importedSvgo,
    "loadConfig",
  );
}

function createSvgoOptimizerForProject(
  options: unknown = { },
): [SVGOptimizer, error] {
  const svgo = importCwd.silent("svgo");
  if (svgo === undefined || svgo === null) {
    return [
      StubSVGOptimizer,
      errors.New("package-local SVGO not found"),
    ];
  }

  if (typeof svgo !== "object" && typeof svgo !== "function") {
    return [
      StubSVGOptimizer,
      errors.New(`unexpected SVGO import (${svgo})`),
    ];
  }

  if (isSvgoV2(svgo)) {
    const instance = svgo as SVGOv2; // type-coverage:ignore-line
    return svgoV2.NewFrom(instance, options);
  } else if (isSvgoV3(svgo)) {
    const instance = svgo as SVGOv2; // type-coverage:ignore-line
    return svgoV3.NewFrom(instance, options);
  } else {
    const instance = svgo as SVGOv1; // type-coverage:ignore-line
    return svgoV1.NewFrom(instance, options);
  }
}

export default createSvgoOptimizerForProject;
