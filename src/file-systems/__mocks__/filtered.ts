import { fileSystemMock } from "./__common__";

const NewFilteredFileSystemMock = jest.fn()
  .mockReturnValue(fileSystemMock)
  .mockName("NewFilteredFileSystem");

export default NewFilteredFileSystemMock;
