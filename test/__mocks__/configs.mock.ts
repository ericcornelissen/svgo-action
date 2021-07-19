import type { Config } from "../../src/configs";

import configs from "../../src/configs";

type NewMock = jest.MockedFunction<typeof configs.New>;

const New: NewMock = jest.fn()
  .mockReturnValue([{ }, null])
  .mockName("configs.New");

export default {
  New,
};

export const _sampleConfig = {} as Config;
