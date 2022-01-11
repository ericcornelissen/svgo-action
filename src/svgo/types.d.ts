import type { error } from "../errors";

type SupportedSvgoVersions = "2" | "project";

interface SVGOptimizer {
  optimize(svg: string): Promise<[string, error]>;
}

export type {
  SupportedSvgoVersions,
  SVGOptimizer,
};
