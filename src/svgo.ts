import SVGO from "svgo";


export type SVGOptions = SVGO.Options;


export class SVGOptimizer {

  private svgo: SVGO;

  constructor(options: SVGOptions = { }) {
    this.svgo = new SVGO(options);
  }

  async optimize(originalSvg: string): Promise<string> {
    const { data: optimizedSvg } = await this.svgo.optimize(originalSvg);
    return optimizedSvg;
  }

}
