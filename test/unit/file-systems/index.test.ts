// SPDX-License-Identifier: MIT

jest.mock("node:fs", () => require("../../__common__/node-fs.mock.ts"));
jest.mock("node:path", () => require("../../__common__/node-path.mock.ts"));
jest.mock("../../../src/file-systems/base");
jest.mock("../../../src/file-systems/filtered");

import * as fs from "node:fs";
import * as path from "node:path";

import NewBaseFileSystem from "../../../src/file-systems/base";
import NewFilteredFileSystem from "../../../src/file-systems/filtered";
import fileSystems from "../../../src/file-systems/index";

const NewBaseFileSystemMock = NewBaseFileSystem as jest.MockedFunction<typeof NewBaseFileSystem>; // eslint-disable-line max-len
const NewFilteredFileSystemMock = NewFilteredFileSystem as jest.MockedFunction<typeof NewFilteredFileSystem>; // eslint-disable-line max-len

describe("file-systems/index.ts", () => {
  beforeEach(() => {
    NewBaseFileSystemMock.mockClear();
    NewFilteredFileSystemMock.mockClear();
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
