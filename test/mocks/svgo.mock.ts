export const SVGOptimizer = jest.fn()
  .mockReturnValue({
    optimize: jest.fn()
      .mockImplementation(async (svg: string): Promise<string> => {
        return `${svg} - but optimized`;
      })
      .mockName("SVGOptimizer.optimize"),
  })
  .mockName("SVGOptimizer");
