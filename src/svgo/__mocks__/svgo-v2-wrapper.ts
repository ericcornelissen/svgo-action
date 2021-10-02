import { optimize } from "./__common__";

const SVGOptimizer = jest.fn()
  .mockReturnValue({ optimize })
  .mockName("svgo.SVGOptimizerV2");

export default SVGOptimizer;
