import type { Dirent, Stats } from "fs";

import { mocked } from "ts-jest/utils";

jest.mock("fs");

import * as _fs from "fs";

import fileSystems from "../../src/file-systems";

const fs = mocked(_fs);

describe("package file-systems", () => {
  const NO_FILTERS = [];

  describe("::listFiles", () => {
    const lstatDir = {
      isFile() { return false; },
    } as Stats;
    const lstatFile = {
      isFile() { return true; },
    } as Stats;

    test("no filters", () => {
      const filters = NO_FILTERS;

      const folder1 = "folder1" as unknown as Dirent;
      const folder1file1 = "folder1/file1" as unknown as Dirent;
      const file1 = "file1" as unknown as Dirent;

      fs.readdirSync.mockReturnValueOnce([folder1, file1]);
      fs.readdirSync.mockReturnValueOnce([folder1file1]);
      fs.existsSync.mockReturnValue(true);

      fs.lstatSync.mockReturnValueOnce(lstatDir);
      fs.lstatSync.mockReturnValueOnce(lstatFile);
      fs.lstatSync.mockReturnValueOnce(lstatFile);

      const fileSystem = fileSystems.New({ filters });

      const files = Array.from(fileSystem.listFiles());
      expect(files).not.toHaveLength(0);
    });

    test("a filter", () => {
      const filters = [() => false];

      const folder1 = "folder1" as unknown as Dirent;
      const folder1file1 = "folder1/file1" as unknown as Dirent;
      const file1 = "file1" as unknown as Dirent;

      fs.readdirSync.mockReturnValueOnce([folder1, file1]);
      fs.readdirSync.mockReturnValueOnce([folder1file1]);
      fs.existsSync.mockReturnValue(true);

      fs.lstatSync.mockReturnValueOnce(lstatDir);
      fs.lstatSync.mockReturnValueOnce(lstatFile);
      fs.lstatSync.mockReturnValueOnce(lstatFile);

      const fileSystem = fileSystems.New({ filters });

      const files = Array.from(fileSystem.listFiles());
      expect(files).toHaveLength(0);
    });
  });

  describe("::readFile", () => {
    const fileHandle = { path: "foo.bar" };

    beforeEach(() => {
      fs.existsSync.mockClear();
      fs.readFileSync.mockClear();
    });

    test("success", async () => {
      const filters = NO_FILTERS;
      const fileContent = "Hello world!";

      fs.existsSync.mockReturnValueOnce(true);
      fs.readFileSync.mockReturnValueOnce(fileContent);

      const fileSystem = fileSystems.New({ filters });

      const [content, err] = await fileSystem.readFile(fileHandle);
      expect(err).toBeNull();
      expect(content).toEqual(fileContent);
    });

    test("read failure", async () => {
      const filters = NO_FILTERS;

      fs.existsSync.mockReturnValueOnce(true);
      fs.readFileSync.mockImplementationOnce(() => { throw new Error(); });

      const fileSystem = fileSystems.New({ filters });

      const [, err] = await fileSystem.readFile(fileHandle);
      expect(err).not.toBeNull();
    });

    test("file does not exists", async () => {
      const filters = NO_FILTERS;

      fs.existsSync.mockReturnValueOnce(false);

      const fileSystem = fileSystems.New({ filters });

      const [, err] = await fileSystem.readFile(fileHandle);
      expect(err).not.toBeNull();
    });

    test("file is filtered out", async () => {
      const filters = [() => false];

      fs.existsSync.mockReturnValueOnce(true);

      const fileSystem = fileSystems.New({ filters });

      const [, err] = await fileSystem.readFile(fileHandle);
      expect(err).not.toBeNull();
    });
  });

  describe("::writeFile", () => {
    const fileHandle = { path: "foo.bar" };
    const fileContent = "Hello world!";

    beforeEach(() => {
      fs.writeFileSync.mockClear();
    });

    test("success", async () => {
      const filters = NO_FILTERS;

      const fileSystem = fileSystems.New({ filters });

      const err = await fileSystem.writeFile(fileHandle, fileContent);
      expect(err).toBeNull();
    });

    test("write failure", async () => {
      const filters = NO_FILTERS;

      fs.writeFileSync.mockImplementationOnce(() => { throw new Error(); });

      const fileSystem = fileSystems.New({ filters });

      const err = await fileSystem.writeFile(fileHandle, fileContent);
      expect(err).not.toBeNull();
    });

    test("file is filtered out", async () => {
      const filters = [() => false];

      fs.existsSync.mockReturnValueOnce(true);

      const fileSystem = fileSystems.New({ filters });

      const err = await fileSystem.writeFile(fileHandle, fileContent);
      expect(err).not.toBeNull();
    });
  });
});
