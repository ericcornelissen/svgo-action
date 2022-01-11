import type { error } from "../../errors";
import type { SVGOptimizer } from "../types";

type SVGO = new (options: SVGOptions) => {
  optimize(svg: string): {
    readonly data: string;
  };
};

type SVGOptions = unknown;

export type {
  error,
  SVGO,
  SVGOptimizer,
  SVGOptions,
};
