type SVGO = new (options: SVGOptions) => {
  optimize(svg: string): {
    readonly data: string;
  };
};

type SVGOptions = unknown;

export type {
  SVGO,
  SVGOptions,
};
