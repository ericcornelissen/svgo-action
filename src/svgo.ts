import svgoV1 from "svgo-v1";
import svgoV2 from "svgo-v2";

export type SVGOptions = svgoV2.Options;

export type AllowedSvgoVersions = 1 | 2;

export class SVGOptimizer {
  private version: AllowedSvgoVersions;
  private options: SVGOptions;
  private svgoV1: svgoV1;

  constructor(version: AllowedSvgoVersions, options: SVGOptions = { }) {
    this.version = version;
    this.options = options;
    this.svgoV1 = new svgoV1(options);
  }

  async optimize(originalSvg: string): Promise<string> {
    switch (this.version) {
      case 1:
        return await this.optimizeV1(originalSvg);
      case 2:
        return await this.optimizeV2(originalSvg);
    }
  }

  private async optimizeV2(originalSvg: string): Promise<string> {
    const { data: optimizedSvg, error } = svgoV2.optimize(
      originalSvg,
      this.options,
    );

    if (error) {
      throw new Error(error);
    }

    return optimizedSvg;
  }

  private async optimizeV1(originalSvg: string): Promise<string> {
    const { data: optimizedSvg } = await this.svgoV1.optimize(originalSvg);
    return optimizedSvg;
  }
}
