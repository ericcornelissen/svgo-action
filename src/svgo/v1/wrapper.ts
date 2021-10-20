import type svgo from "svgo-v1";

import type { error } from "../../types";
import type { SVGOptions } from "./types";

import errors from "../../errors";

class SvgoV1Wrapper {
  private svgo: svgo;

  constructor(svgo: svgo, options: SVGOptions) {
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

export default SvgoV1Wrapper;
