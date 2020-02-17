import SVGO from "svgo";


export class SVGOptimizer {

  private svgo: SVGO;

  constructor(config?: object) {
    this.svgo = new SVGO(config || {});
  }

  async optimize(originalSvg: string): Promise<string> {
    const { data: optimizedSvg } = await this.svgo.optimize(originalSvg);
    return optimizedSvg;
  }

}
