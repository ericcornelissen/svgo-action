export const SVGOptimizer = jest.fn()
  .mockReturnValue({
    optimize: jest.fn()
      .mockImplementation(async (svg: string): Promise<string> => svg)
      .mockName("SVGOptimizer.optimize"),
  })
  .mockName("SVGOptimizer");
