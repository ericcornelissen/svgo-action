const BaseFileSystemMock = {
  listFiles: jest.fn()
    .mockReturnValue([])
    .mockName("BaseFileSystem.listFiles"),
  readFile: jest.fn()
    .mockReturnValue(["", null])
    .mockName("BaseFileSystem.readFile"),
  writeFile: jest.fn()
    .mockReturnValue(null)
    .mockName("BaseFileSystem.writeFile"),
};

const NewBaseFileSystemMock = jest.fn()
  .mockReturnValue(BaseFileSystemMock)
  .mockName("NewBaseFileSystem");

export default NewBaseFileSystemMock;
