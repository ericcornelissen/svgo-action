import type { error } from "../types";

import svgo from "svgo-v1";

import errors from "../errors";

type SVGOptions = svgo.Options;

class SVGOptimizer {
  private svgo: svgo;

  constructor(options: SVGOptions = { }) {
    this.svgo = new svgo(options);
  }

  async optimize(originalSvg: string): Promise<[string, error]> {
    let optimizedSvg = "";
    let err: error = null;

    try {
      const { data } = await this.svgo.optimize(originalSvg);
      optimizedSvg = data;
    } catch (thrownError) {
      err = errors.New(`could not optimize SVG (${thrownError})`);
    }

    return [optimizedSvg, err];
  }
}

export default SVGOptimizer;
