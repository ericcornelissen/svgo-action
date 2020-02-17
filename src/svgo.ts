import SVGO from "svgo";


export class SVGOptimizer {

  private svg: SVGO;

  constructor(config?: object) {
    this.svg = new SVGO(config || {});
  }

  async optimize(originalSvg: string): Promise<string> {
    const { data: optimizedSvg } = await this.svg.optimize(originalSvg);
    return optimizedSvg;
  }

}
