export const optimizerInstance = {
  optimize: jest.fn()
    .mockImplementation(async (originalSvg) => originalSvg)
    .mockName("SVGOptimizer.optimize"),
};

export const getDefaultConfig = jest.fn()
  .mockReturnValue({ })
  .mockName("svgo.getDefaultConfig");

export const SVGOptimizer = jest.fn()
  .mockReturnValue(optimizerInstance)
  .mockName("SVGOptimizer");
