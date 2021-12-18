import type { error } from "../errors";

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
