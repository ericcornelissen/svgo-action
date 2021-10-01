const optimize = jest.fn()
  .mockReturnValue({ data: "<svg></svg>" })
  .mockName("SVGOptimizer.optimize");

export {
  optimize,
};
