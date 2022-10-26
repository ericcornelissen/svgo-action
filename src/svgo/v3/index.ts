import type { error } from "../../errors";
import type { SVGOptimizer } from "../types";
import type { SVGO, SVGOptions } from "../v2/types";

import svgo from "svgo-v3"; // eslint-disable-line import/default

import SvgoV2Wrapper from "../v2/wrapper";

function New(options: SVGOptions): [SVGOptimizer, error] {
  return NewFrom(svgo, options);
}

function NewFrom(
  importedSvgo: SVGO,
  options: SVGOptions,
): [SVGOptimizer, error] {
  return [new SvgoV2Wrapper(importedSvgo, options), null];
}

export default {
  New,
  NewFrom,
};
