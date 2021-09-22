import { fileSystemMock } from "./__common__";

const NewBaseFileSystemMock = jest.fn()
  .mockReturnValue(fileSystemMock)
  .mockName("NewBaseFileSystem");

export default NewBaseFileSystemMock;
