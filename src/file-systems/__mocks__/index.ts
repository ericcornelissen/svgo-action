const listFiles = jest.fn()
  .mockReturnValue([])
  .mockName("fs.listFiles");

const readFile = jest.fn()
  .mockResolvedValue(["", null])
  .mockName("fs.readFile");

const writeFile = jest.fn()
  .mockResolvedValue(null)
  .mockName("fs.writeFile");

const fileSystem = {
  listFiles,
  readFile,
  writeFile,
};

const New = jest.fn()
  .mockReturnValue(fileSystem)
  .mockName("file-systems.New");

export default {
  New,
};
