import type { error } from "../../errors";
import type { SVGO, SVGOptimizer, SVGOptions } from "./types";

import svgo from "svgo-v2"; // eslint-disable-line import/default

import SvgoV2Wrapper from "./wrapper";

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
