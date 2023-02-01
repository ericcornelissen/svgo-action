import type { SVGO, SVGOptions } from "./svgo-v1";
import type { error } from "../../errors";

import errors from "../../errors";

class SvgoV1Wrapper {
  private svgo: InstanceType<SVGO>;

  constructor(svgo: SVGO, options: SVGOptions) {
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
