// SPDX-License-Identifier: MIT

import { filter } from "./__common__";

const NewPrFilesFilter = jest.fn()
  .mockReturnValue([filter, null])
  .mockName("filters.NewPrFilesFilter");

export default NewPrFilesFilter;
