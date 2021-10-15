import type { error } from "../../types";
import type { SVGOptimizer } from "../types";
import type { SVGOptions } from "./types";

import svgo from "svgo-v1";

import SvgoV1Wrapper from "./wrapper";

function New(options: SVGOptions = { }): [SVGOptimizer, error] {
  return [new SvgoV1Wrapper(svgo, options), null];
}

export default {
  New,
};
