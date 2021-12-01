import type { error } from "../../types";
import type { SVGOptimizer } from "../types";
import type { SVGOptions } from "./types";

import svgo from "svgo-v2"; // eslint-disable-line import/default

import SvgoV2Wrapper from "./wrapper";

function New(options: SVGOptions): [SVGOptimizer, error] {
  return NewFrom(svgo, options);
}

function NewFrom(
  importedSvgo: svgo,
  options: SVGOptions,
): [SVGOptimizer, error] {
  return [new SvgoV2Wrapper(importedSvgo, options), null];
}

export default {
  New,
  NewFrom,
};
