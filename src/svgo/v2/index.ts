import type { error } from "../../errors";
import type { SVGOptimizer } from "../types";
import type { SVGOptions } from "svgo-v2";

import svgo from "svgo-v2"; // eslint-disable-line import/default

import SvgoV2Wrapper from "./wrapper";

function New(options: SVGOptions): [SVGOptimizer, error] {
  return NewFrom(svgo, options);
}

function NewFrom(
  importedSvgo: typeof svgo,
  options: SVGOptions,
): [SVGOptimizer, error] {
  return [new SvgoV2Wrapper(importedSvgo, options), null];
}

export default {
  New,
  NewFrom,
};
