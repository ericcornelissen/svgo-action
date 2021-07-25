import type { error } from "../../../src/types";

import { mocked } from "ts-jest/utils";

jest.mock("../../../src/file-systems/base");
jest.mock("../../../src/file-systems/filtered");

import _NewBaseFileSystem from "../../../src/file-systems/base";
import _NewFilteredFileSystem from "../../../src/file-systems/filtered";
import fileSystems from "../../../src/file-systems/index";

const NewBaseFileSystem = mocked(_NewBaseFileSystem);
const NewFilteredFileSystem = mocked(_NewFilteredFileSystem);

describe("file-systems/index.ts", () => {
  const fileSystem = {
    listFiles: () => [],
    readFile: (): Promise<[string, error]> => Promise.resolve(["", null]),
    writeFile: (): Promise<error> => Promise.resolve(null),
  };

  beforeEach(() => {
    NewBaseFileSystem.mockClear();
    NewFilteredFileSystem.mockClear();
  });

  describe("::New", () => {
    test("create file system", () => {
      NewBaseFileSystem.mockReturnValueOnce(fileSystem);

      const fs = fileSystems.New();
      expect(fs).toBe(fileSystem);

      expect(NewBaseFileSystem).toHaveBeenCalled();
      expect(NewFilteredFileSystem).not.toHaveBeenCalled();
    });
  });

  describe("::NewFiltered", () => {
    test("create file system", () => {
      NewFilteredFileSystem.mockReturnValueOnce(fileSystem);

      const [fs, err] = fileSystems.NewFiltered({ filters: [] });
      expect(err).toBeNull();
      expect(fs).toBe(fileSystem);

      expect(NewFilteredFileSystem).toHaveBeenCalled();
    });
  });
});
