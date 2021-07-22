import type { error } from "../types";

import svgo from "svgo-v2";

import errors from "../errors";

type SVGOptions = svgo.Options;

class SVGOptimizer {
  private options: SVGOptions;

  constructor(options: SVGOptions = { }) {
    this.options = options;
  }

  async optimize(originalSvg: string): Promise<[string, error]> {
    let optimizedSvg = "";
    let err: error = null;

    try {
      const { data } = svgo.optimize(originalSvg, this.options);
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
