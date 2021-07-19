import type { FileSystem } from "../../src/file-systems";

import fileSystems from "../../src/file-systems";

type FileSystemMock = jest.Mocked<FileSystem>;

type NewMock = jest.MockedFunction<typeof fileSystems.New>;

function createFileSystemMock(): FileSystemMock {
  return {
    listFiles: jest.fn()
      .mockReturnValue([])
      .mockName("fs.listFile"),
    readFile: jest.fn()
      .mockResolvedValue(["Hello world!", null])
      .mockName("fs.readFile"),
    writeFile: jest.fn()
      .mockResolvedValue(null)
      .mockName("fs.writeFile"),
  };
}

const New: NewMock = jest.fn()
  .mockImplementation(() => [createFileSystemMock, null])
  .mockName("file-systems.New");

const NewStandard: NewMock = jest.fn()
  .mockImplementation(() => [createFileSystemMock, null])
  .mockName("file-systems.NewStandard");

export default {
  New,
  NewStandard,
};

export const _sampleFs = createFileSystemMock();
