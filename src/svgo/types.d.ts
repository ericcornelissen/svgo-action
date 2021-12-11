import type { error } from "../types";

type SupportedSvgoVersions = "1" | "2" | "project";

interface SVGOptimizer {
  optimize(svg: string): Promise<[string, error]>;
}

export type {
  error,
  SupportedSvgoVersions,
  SVGOptimizer,
};
