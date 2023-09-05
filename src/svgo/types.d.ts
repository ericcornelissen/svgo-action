import type { error } from "../errors";

type SupportedSvgoVersions =
  "2" |
  "3" |
  "project";

interface SVGOptimizer {
  optimize(svg: string): Promise<[string, error]>;
}

export type {
  SupportedSvgoVersions,
  SVGOptimizer,
};
