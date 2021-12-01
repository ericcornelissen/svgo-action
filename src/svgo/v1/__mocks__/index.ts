/* eslint-disable jest/no-mocks-import */

import { optimizer } from "../../__mocks__/__common__";

const New = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.v1.New");

const NewFrom = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.v1.NewFrom");

export default {
  New,
  NewFrom,
};
