import type { FileSystem } from "../../src/file-systems";

import fileSystems from "../../src/file-systems";

type FileSystemMock = jest.Mocked<FileSystem>;

type NewMock = jest.MockedFunction<typeof fileSystems.New>;
type NewFilteredMock = jest.MockedFunction<typeof fileSystems.NewFiltered>;

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
  .mockImplementation(() => createFileSystemMock())
  .mockName("file-systems.New");

const NewFiltered: NewFilteredMock = jest.fn()
  .mockImplementation(() => [createFileSystemMock(), null])
  .mockName("file-systems.NewFiltered");

export default {
  New,
  NewFiltered,
};

export const _sampleFs = createFileSystemMock();
