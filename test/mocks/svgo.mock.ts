export const optimizerInstance = {
  optimize: jest.fn()
    .mockImplementation(async (originalSvg) => originalSvg)
    .mockName("SVGOptimizer.optimize"),
};

export const SVGOptimizer = jest.fn()
  .mockReturnValue(optimizerInstance)
  .mockName("SVGOptimizer");
