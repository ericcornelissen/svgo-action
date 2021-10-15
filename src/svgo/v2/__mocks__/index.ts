/* eslint-disable jest/no-mocks-import */

import { optimizer } from "../../__mocks__/__common__";

const New = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.v2.New");

export default {
  New,
};
