import type { error } from "../../errors";
import type { SVGO, SVGOptions } from "./types";

import errors from "../../errors";

class SVGOptimizer {
  private options: SVGOptions;
  private svgo: SVGO;

  constructor(svgo: SVGO, options: SVGOptions) {
    this.svgo = svgo;
    this.options = options;
  }

  async optimize(originalSvg: string): Promise<[string, error]> {
    let optimizedSvg = "";
    let err: error = null;

    try {
      const { data } = this.svgo.optimize(originalSvg, this.options);
      optimizedSvg = data;

      if (data === "") {
        err = errors.New("invalid svg");
      }
    } catch (thrownError) {
      err = errors.New(`could not optimize SVG (${thrownError})`);
    }

    return [optimizedSvg, err];
  }
}

export default SVGOptimizer;
