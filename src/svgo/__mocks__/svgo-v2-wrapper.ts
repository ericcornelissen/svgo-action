const optimize = jest.fn()
  .mockReturnValue({ data: "<svg></svg>" })
  .mockName("SVGOptimizerV2.optimize");

const SVGOptimizer = jest.fn()
  .mockReturnValue({ optimize })
  .mockName("SVGOptimizer");

export default SVGOptimizer;
