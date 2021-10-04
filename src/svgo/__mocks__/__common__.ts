const optimize = jest.fn()
  .mockReturnValue({ data: "<svg></svg>" })
  .mockName("SVGOptimizer.optimize");

const optimizer = { optimize };

export {
  optimize,
  optimizer,
};
