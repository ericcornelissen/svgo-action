import svgoOld from "svgo-v1";
import svgo from "svgo-v2";

type allowedVersions = 1 | 2;
type SVGO = { optimize };
export type SVGOptions = svgo.Options;


export class SVGOptimizer {

  private version: allowedVersions;
  private options: SVGOptions;
  private svgo: SVGO;

  constructor(version: allowedVersions, options: SVGOptions = { }) {
    this.version = version;
    this.options = options;
    this.svgo = new svgoOld(options);
  }

  async optimize(originalSvg: string): Promise<string> {
    switch (this.version) {
      case 1:
        return await this.optimizeV1(originalSvg);
      case 2:
        return await this.optimizeV2(originalSvg);
    }
  }

  private async optimizeV1(originalSvg: string): Promise<string> {
    const { data: optimizedSvg } = await this.svgo.optimize(originalSvg);
    return optimizedSvg;
  }

  private async optimizeV2(originalSvg: string): Promise<string> {
    const { data: optimizedSvg, error } = svgo.optimize(
      originalSvg,
      this.options,
    );

    if (error) {
      throw new Error(error);
    }

    return optimizedSvg;
  }

}
