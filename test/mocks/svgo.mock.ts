export const optimizerInstance = {
  optimize: jest.fn()
    .mockImplementation(async (originalSvg) => originalSvg)
    .mockName("optimize"),
};

const SVGOptimizer = jest.fn()
  .mockReturnValue(optimizerInstance)
  .mockName("SVGOptimizer");

export default SVGOptimizer;
