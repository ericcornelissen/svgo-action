const fileSystemMock = {
  listFiles: jest.fn()
    .mockReturnValue([])
    .mockName("file-systems.FileSystem.listFiles"),
  readFile: jest.fn()
    .mockReturnValue(["", null])
    .mockName("file-systems.FileSystem.readFile"),
  writeFile: jest.fn()
    .mockReturnValue(null)
    .mockName("file-systems.FileSystem.writeFile"),
};

export {
  fileSystemMock,
};
