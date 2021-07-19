import type { error } from "../types";
import type { AllowedSvgoVersions, SVGOptions } from "./types";

import svgoV1 from "svgo-v1";
import svgoV2 from "svgo-v2";

import errors from "../errors";

export class SVGOptimizer {
  private version: AllowedSvgoVersions;
  private options: SVGOptions;
  private svgoV1: svgoV1;

  constructor(version: AllowedSvgoVersions, options: SVGOptions = { }) {
    this.version = version;
    this.options = options;
    this.svgoV1 = new svgoV1(options);
  }

  async optimize(originalSvg: string): Promise<[string, error]> {
    switch (this.version) {
      case 1:
        return await this.optimizeV1(originalSvg);
      case 2:
        return this.optimizeV2(originalSvg);
    }
  }

  private optimizeV2(originalSvg: string): [string, error] {
    let optimizedSvg = "";
    let err: error = null;

    try {
      const { data } = svgoV2.optimize(
        originalSvg,
        this.options,
      );

      if (data === "") {
        err = errors.New("invalid svg");
      }

      optimizedSvg = data;
    } catch (thrownError) {
      err = errors.New(`could not optimize SVG (${thrownError})`);
    }


    return [optimizedSvg, err];
  }

  private async optimizeV1(originalSvg: string): Promise<[string, error]> {
    let optimizedSvg = "";
    let err: error = null;

    try {
      const { data } = await this.svgoV1.optimize(originalSvg);
      optimizedSvg = data;
    } catch (thrownError) {
      err = errors.New(`could not optimize SVG (${thrownError})`);
    }

    return [optimizedSvg, err];
  }
}
