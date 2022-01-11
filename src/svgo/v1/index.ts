import type { error } from "../../errors";
import type { SVGO, SVGOptimizer, SVGOptions } from "./types";

import SvgoV1Wrapper from "./wrapper";

function NewFrom(
  importedSvgo: SVGO,
  options: SVGOptions,
): [SVGOptimizer, error] {
  return [new SvgoV1Wrapper(importedSvgo, options), null];
}

export default {
  NewFrom,
};
