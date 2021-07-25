const FilteredFileSystemMock = {
  listFiles: jest.fn()
    .mockReturnValue([])
    .mockName("FilteredFileSystem.listFiles"),
  readFile: jest.fn()
    .mockReturnValue(["", null])
    .mockName("FilteredFileSystem.readFile"),
  writeFile: jest.fn()
    .mockReturnValue(null)
    .mockName("FilteredFileSystem.writeFile"),
};

const NewFilteredFileSystemMock = jest.fn()
  .mockReturnValue(FilteredFileSystemMock)
  .mockName("NewFilteredFileSystem");

export default NewFilteredFileSystemMock;
