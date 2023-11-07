// SPDX-License-Identifier: MIT

import { filter } from "./__common__";

const NewGlobFilter = jest.fn()
  .mockResolvedValue(filter)
  .mockName("filters.NewGlobFilter");

export default NewGlobFilter;
