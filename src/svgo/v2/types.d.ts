import type { SVGOptimizer } from "../types";

interface SVGO {
  optimize(svg: string, options: SVGOptions): {
    readonly data: string;
  };
}

type SVGOptions = unknown;

export type {
  SVGO,
  SVGOptimizer,
  SVGOptions,
};
