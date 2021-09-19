import { defaultConfig } from "./__common__";

const New = jest.fn()
  .mockReturnValue([defaultConfig, null])
  .mockName("inputs.New");

export default {
  New,
};
