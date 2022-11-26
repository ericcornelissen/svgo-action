import type { error } from "../errors";

interface Logger {
  readonly warning: (msg: string) => void;
}

type SupportedSvgoVersions =
  "2" |
  "3" |
  "project";

interface SVGOptimizer {
  optimize(svg: string): Promise<[string, error]>;
}

export type {
  Logger,
  SupportedSvgoVersions,
  SVGOptimizer,
};
