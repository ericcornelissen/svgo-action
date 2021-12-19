import type { error } from "../../errors";
import type { SVGOptimizer } from "../types";
import type svgo from "svgo-v1";

type SVGOptions = svgo.Options;

export type {
  error,
  SVGOptimizer,
  SVGOptions,
};
