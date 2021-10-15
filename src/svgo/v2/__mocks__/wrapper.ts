/* eslint-disable jest/no-mocks-import */

import { optimize } from "../../__mocks__/__common__";

const SvgoV2Wrapper = jest.fn()
  .mockReturnValue({ optimize })
  .mockName("svgo.v2.SvgoV2Wrapper");

export default SvgoV2Wrapper;
