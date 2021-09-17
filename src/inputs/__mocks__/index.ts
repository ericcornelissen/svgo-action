import { defaultConfig } from "./__common__";

const New = jest.fn()
  .mockReturnValue([defaultConfig, null])
  .mockName("configs.New");

export default {
  New,
};
