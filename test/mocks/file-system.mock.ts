import { FileInfo, FileSystem } from "../../src/file-system";

const defaultFile: FileInfo = {
  path: "/foo/bar.svg",
  extension: "svg",
};

const fs: FileSystem = {
  listFiles: jest.fn()
    .mockReturnValue([])
    .mockName("fs.listFile"),
  readFile: jest.fn()
    .mockReturnValue(defaultFile)
    .mockName("fs.readFile"),
  writeFile: jest.fn()
    .mockName("fs.writeFile"),
};

export default fs;
