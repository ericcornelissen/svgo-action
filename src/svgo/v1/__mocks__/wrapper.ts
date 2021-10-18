/* eslint-disable jest/no-mocks-import */

import { optimize } from "../../__mocks__/__common__";

const SvgoV1Wrapper = jest.fn()
  .mockReturnValue({ optimize })
  .mockName("svgo.v1.SvgoV1Wrapper");

export default SvgoV1Wrapper;
