// SPDX-License-Identifier: MIT

import { optimizer } from "../../__mocks__/__common__"; // eslint-disable-line jest/no-mocks-import

const SvgoV2Wrapper = jest.fn()
  .mockReturnValue(optimizer)
  .mockName("svgo.v2.SvgoV2Wrapper");

export default SvgoV2Wrapper;
