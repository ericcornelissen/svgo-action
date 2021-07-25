import type { OptimizeProjectData } from "../../src/types";

import optimize from "../../src/optimize";

type OptimizeFilesMock = jest.MockedFunction<typeof optimize.Files>;

const Files: OptimizeFilesMock = jest.fn()
  .mockResolvedValue([{ }, null])
  .mockName("optimize.Files");

export default {
  Files,
};

export const _sampleData: OptimizeProjectData = {
  ignoredCount: 0,
  optimizedCount: 0,
  svgCount: 0,
};
