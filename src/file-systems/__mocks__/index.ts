// SPDX-License-Identifier: MIT

import { fileSystemMock } from "./__common__";

const New = jest.fn()
  .mockReturnValue(fileSystemMock)
  .mockName("file-systems.New");

export default {
  New,
};
