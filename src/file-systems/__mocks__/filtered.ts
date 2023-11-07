// SPDX-License-Identifier: MIT

import { fileSystemMock } from "./__common__";

const NewFilteredFileSystemMock = jest.fn()
  .mockReturnValue(fileSystemMock)
  .mockName("file-systems.NewFilteredFileSystem");

export default NewFilteredFileSystemMock;
