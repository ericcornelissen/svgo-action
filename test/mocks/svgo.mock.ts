export const svgo = {
  optimize: jest.fn().mockName("optimize"),
};

const SVGOptimizer = jest.fn().mockReturnValue(svgo).mockName("SVGOptimizer");
export default SVGOptimizer;
