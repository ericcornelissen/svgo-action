import { optimize } from "./__common__";

const optimizer = { optimize };

const New = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.New");

export default {
  New,
};
