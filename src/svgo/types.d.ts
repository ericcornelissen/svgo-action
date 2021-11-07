import type { error } from "../types";

type SupportedSvgoVersions = string;

interface SVGOptimizer {
  optimize(svg: string): Promise<[string, error]>;
}

export type {
  SupportedSvgoVersions,
  SVGOptimizer,
};
