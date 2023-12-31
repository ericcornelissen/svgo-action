// SPDX-License-Identifier: MIT

import { optimizer } from "../../__mocks__/__common__"; // eslint-disable-line jest/no-mocks-import

const New = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.v3.New");

const NewFrom = jest.fn()
  .mockReturnValue([optimizer, null])
  .mockName("svgo.v3.NewFrom");

export default {
  New,
  NewFrom,
};
