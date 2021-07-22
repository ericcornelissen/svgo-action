import type { SVGOptimizer } from "../../src/svgo";

import svgo from "../../src/svgo";

type NewMock = jest.MockedFunction<typeof svgo.New>;

const New: NewMock = jest.fn()
  .mockReturnValue([{ optimize: jest.fn() }, null])
  .mockName("svgo.New");

export default {
  New,
};

export const _sampleSvgo = { } as SVGOptimizer;
