import type { error } from "../types";

type SupportedSvgoVersions = 1 | 2;

interface SVGOptimizer {
  optimize(svg: string): Promise<[string, error]>;
}

export type {
  SupportedSvgoVersions,
  SVGOptimizer,
};
