export const optimizerInstance = {
  optimize: jest.fn()
    .mockImplementation(async (originalSvg) => originalSvg)
    .mockName("SVGOptimizer.optimize"),
};

const SVGOptimizer = jest.fn()
  .mockReturnValue(optimizerInstance)
  .mockName("SVGOptimizer");

export default SVGOptimizer;
