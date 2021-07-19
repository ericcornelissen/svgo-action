import type { SVGOptimizer } from "../../src/svgo";

import svgo from "../../src/svgo";

type NewMock = jest.MockedFunction<typeof svgo.New>;

const New: NewMock = jest.fn()
  .mockResolvedValue([{ }, null])
  .mockName("svgo.New");

export default {
  New,
};

export const _sampleSvgo = { } as SVGOptimizer;
