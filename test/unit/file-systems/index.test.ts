import { mocked } from "ts-jest/utils";

jest.mock("fs");
jest.mock("path");
jest.mock("../../../src/file-systems/base");
jest.mock("../../../src/file-systems/filtered");

import * as fs from "fs";
import * as path from "path";

import _NewBaseFileSystem from "../../../src/file-systems/base";
import _NewFilteredFileSystem from "../../../src/file-systems/filtered";
import fileSystems from "../../../src/file-systems/index";

const NewBaseFileSystem = mocked(_NewBaseFileSystem);
const NewFilteredFileSystem = mocked(_NewFilteredFileSystem);

describe("file-systems/index.ts", () => {
  beforeEach(() => {
    NewBaseFileSystem.mockClear();
    NewFilteredFileSystem.mockClear();
  });

  describe("::New", () => {
    test("create file system", () => {
      const baseFs = NewBaseFileSystem({ fs, path });
      const expectedFs = NewFilteredFileSystem({ fs: baseFs, filters: [] });

      const result = fileSystems.New({ filters: [] });
      expect(result).toBe(expectedFs);

      expect(NewBaseFileSystem).toHaveBeenCalled();
      expect(NewFilteredFileSystem).toHaveBeenCalled();
    });
  });
});
