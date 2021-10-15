import type { error } from "../../types";
import type { SVGOptimizer } from "../types";
import type { SVGOptions } from "./types";

import svgo from "svgo-v2";

import SvgoV2Wrapper from "./wrapper";

function New(options: SVGOptions = { }): [SVGOptimizer, error] {
  return [new SvgoV2Wrapper(svgo, options), null];
}

export default {
  New,
};
