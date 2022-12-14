declare module "svgo-v2" {
  interface SVGO {
    optimize(svg: string, options: SVGOptions): {
      readonly data: string;
    };
  }

  type SVGOptions = unknown;

  export type {
    SVGO,
    SVGOptions,
  };

  let svgo: SVGO;
  export default svgo;
}
