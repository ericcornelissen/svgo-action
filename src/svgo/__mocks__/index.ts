import { optimizer } from "./__common__";

const New = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.New");

export default {
  New,
};
