import type { OptimizeProjectData } from "../../src/types";

import * as optimize from "../../src/optimize";

type OptimizeSvgsMock = jest.MockedFunction<typeof optimize.optimizeSvgs>;

const optimizeSvgs: OptimizeSvgsMock = jest.fn()
  .mockResolvedValue([{ }, null])
  .mockName("optimizeSvgs");

export default {
  optimizeSvgs,
};

export const _sampleData: OptimizeProjectData = {
  ignoredCount: 0,
  optimizedCount: 0,
  svgCount: 0,
};
