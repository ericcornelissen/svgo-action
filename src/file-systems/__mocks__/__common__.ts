const fileSystemMock = {
  listFiles: jest.fn()
    .mockReturnValue([])
    .mockName("FileSystem.listFiles"),
  readFile: jest.fn()
    .mockReturnValue(["", null])
    .mockName("FileSystem.readFile"),
  writeFile: jest.fn()
    .mockReturnValue(null)
    .mockName("FileSystem.writeFile"),
};

export {
  fileSystemMock,
};
