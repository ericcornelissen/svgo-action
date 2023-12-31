// SPDX-License-Identifier: MIT

import { parser } from "./__common__";

const buildSafeParser = jest.fn()
  .mockReturnValue(parser)
  .mockName("parsers.buildSafeParser");

export {
  buildSafeParser,
};
