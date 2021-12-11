import type { error, SVGOptimizer, SVGOptions } from "./types";

import svgo from "svgo-v1";

import SvgoV1Wrapper from "./wrapper";

function New(options: SVGOptions): [SVGOptimizer, error] {
  return NewFrom(svgo, options);
}

function NewFrom(
  importedSvgo: svgo,
  options: SVGOptions,
): [SVGOptimizer, error] {
  return [new SvgoV1Wrapper(importedSvgo, options), null];
}

export default {
  New,
  NewFrom,
};
