import { fileSystemMock } from "./__common__";

const NewBaseFileSystemMock = jest.fn()
  .mockReturnValue(fileSystemMock)
  .mockName("file-systems.NewBaseFileSystem");

export default NewBaseFileSystemMock;
