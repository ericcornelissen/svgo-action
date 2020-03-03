import optimizations from "../fixtures/optimizations.json";


export const optimizerInstance = {
  optimize: jest.fn()
    .mockImplementation(async (svg) => {
      for (const { optimized, original } of optimizations) {
        if (original === svg) {
          return optimized;
        }
      }
    })
    .mockName("SVGOptimizer.optimize"),
};

export const fetchSvgoOptions = jest.fn()
  .mockReturnValue({ })
  .mockName("svgo.fetchSvgoOptions");

export const SVGOptimizer = jest.fn()
  .mockReturnValue(optimizerInstance)
  .mockName("SVGOptimizer");
