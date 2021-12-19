import { optimizer } from "./__common__";

const StubSVGOptimizer = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.StubSVGOptimizer");

export default StubSVGOptimizer;
