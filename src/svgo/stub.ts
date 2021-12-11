import type { error } from "../types";

import errors from "../errors";

const StubSVGOptimizer = {
  optimize(svg: string): Promise<[string, error]> {
    return Promise.resolve([
      svg,
      errors.New("invalid SVGOptimizer instance"),
    ]);
  },
};

export default StubSVGOptimizer;
