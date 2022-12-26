import type { error } from "../../errors";
import type { SVGOptimizer } from "../types";
import type { SVGO, SVGOptions } from "./svgo-v1";

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
