/* eslint-disable jest/no-mocks-import */

import { optimizer } from "../../__mocks__/__common__";

const NewFrom = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.v1.NewFrom");

export default {
  NewFrom,
};
