const optimizedSvgData = {
  data: "<svg></svg>",
};

const optimize = jest.fn()
  .mockReturnValue(optimizedSvgData)
  .mockName("svgo.SVGOptimizer.optimize");

const optimizer = {
  optimize,
};

export {
  optimize,
  optimizer,
};
