import type { error } from "../types";
import type { SVGOptimizer } from "./types";

import importFrom from "import-from";

import errors from "../errors";
import svgoV1 from "./v1";
import svgoV2 from "./v2";

interface Core {
  getState(key: string): string;
}

function isSvgoV2(importedSvgo: unknown): boolean {
  return Object.prototype.hasOwnProperty.call(importedSvgo, "optimize");
}

function createSvgoForVersion(
  core: Core,
  options: unknown = { },
): [SVGOptimizer, error] {
  const installPath = core.getState("NODE_MODULES");
  const svgo = importFrom.silent(installPath, "svgo");
  if (svgo === undefined) {
    return [
      null as unknown as SVGOptimizer,
      errors.New("custom SVGO not found"),
    ];
  }

  if (isSvgoV2(svgo)) {
    return svgoV2.NewFrom(svgo, options);
  } else {
    return svgoV1.NewFrom(svgo, options);
  }
}

export default createSvgoForVersion;
