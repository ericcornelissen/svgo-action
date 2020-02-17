export const optimizerInstance = {
  optimize: jest.fn().mockName("optimize"),
};

const SVGOptimizer = jest.fn()
  .mockReturnValue(optimizerInstance)
  .mockName("SVGOptimizer");

export default SVGOptimizer;
