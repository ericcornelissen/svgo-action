import type { Dirent, Stats } from "node:fs";

jest.mock("node:fs", () => require("../__common__/node-fs.mock.ts"));

import * as fs from "node:fs";

import fileSystems from "../../src/file-systems";

const fsExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
const fsLstatSync = fs.lstatSync as jest.MockedFunction<typeof fs.lstatSync>;
const fsOpenSync = fs.openSync as jest.MockedFunction<typeof fs.openSync>;
const fsReaddirSync = fs.readdirSync as jest.MockedFunction<typeof fs.readdirSync>; // eslint-disable-line max-len
const fsReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>; // eslint-disable-line max-len
const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>; // eslint-disable-line max-len

describe("package file-systems", () => {
  const NO_FILTERS: Iterable<never> = [];

  describe("::listFiles", () => {
    const lstatDir = {
      isFile() { return false; },
    } as Stats;
    const lstatFile = {
      isFile() { return true; },
    } as Stats;

    const folder1 = "folder1" as unknown as Dirent;
    const folder1file1 = "folder1/file1" as unknown as Dirent;
    const file1 = "file1" as unknown as Dirent;

    beforeEach(() => {
      fsReaddirSync.mockReturnValueOnce([folder1, file1]);
      fsReaddirSync.mockReturnValueOnce([folder1file1]);
      fsExistsSync.mockReturnValue(true);

      fsLstatSync.mockReturnValueOnce(lstatDir);
      fsLstatSync.mockReturnValueOnce(lstatFile);
      fsLstatSync.mockReturnValueOnce(lstatFile);
    });

    test("no filters", () => {
      const filters = NO_FILTERS;

      const fileSystem = fileSystems.New({ filters });

      const files = Array.from(fileSystem.listFiles());
      expect(files).not.toHaveLength(0);
    });

    test("a filter", () => {
      const filters = [() => false];

      const fileSystem = fileSystems.New({ filters });

      const files = Array.from(fileSystem.listFiles());
      expect(files).toHaveLength(0);
    });
  });

  describe("::readFile", () => {
    const fileHandle = { path: "foo.bar" };

    beforeEach(() => {
      fsOpenSync.mockClear();
      fsReadFileSync.mockClear();
    });

    test("success", async () => {
      const filters = NO_FILTERS;
      const fileContent = "Hello world!";

      fsOpenSync.mockReturnValueOnce(1);
      fsReadFileSync.mockReturnValueOnce(fileContent);

      const fileSystem = fileSystems.New({ filters });

      const [content, err] = await fileSystem.readFile(fileHandle);
      expect(err).toBeNull();
      expect(content).toBe(fileContent);
    });

    test("read failure", async () => {
      const filters = NO_FILTERS;

      fsOpenSync.mockReturnValueOnce(1);
      fsReadFileSync.mockImplementationOnce(() => { throw new Error(); });

      const fileSystem = fileSystems.New({ filters });

      const [, err] = await fileSystem.readFile(fileHandle);
      expect(err).not.toBeNull();
    });

    test("file does not exists", async () => {
      const filters = NO_FILTERS;

      fsOpenSync.mockImplementationOnce(() => { throw new Error(); });

      const fileSystem = fileSystems.New({ filters });

      const [, err] = await fileSystem.readFile(fileHandle);
      expect(err).not.toBeNull();
    });

    test("file is filtered out", async () => {
      const filters = [() => false];

      fsOpenSync.mockReturnValueOnce(1);

      const fileSystem = fileSystems.New({ filters });

      const [, err] = await fileSystem.readFile(fileHandle);
      expect(err).not.toBeNull();
    });
  });

  describe("::writeFile", () => {
    const fileHandle = { path: "foo.bar" };
    const fileContent = "Hello world!";

    beforeEach(() => {
      fsOpenSync.mockClear();
      fsWriteFileSync.mockClear();
    });

    test("success", async () => {
      const filters = NO_FILTERS;

      const fileSystem = fileSystems.New({ filters });

      const err = await fileSystem.writeFile(fileHandle, fileContent);
      expect(err).toBeNull();
    });

    test("write failure", async () => {
      const filters = NO_FILTERS;

      fsWriteFileSync.mockImplementationOnce(() => { throw new Error(); });

      const fileSystem = fileSystems.New({ filters });

      const err = await fileSystem.writeFile(fileHandle, fileContent);
      expect(err).not.toBeNull();
    });

    test("file cannot be opened", async () => {
      const filters = NO_FILTERS;

      fsOpenSync.mockImplementationOnce(() => { throw new Error(); });

      const fileSystem = fileSystems.New({ filters });

      const err = await fileSystem.writeFile(fileHandle, fileContent);
      expect(err).not.toBeNull();
    });

    test("file is filtered out", async () => {
      const filters = [() => false];

      fsExistsSync.mockReturnValueOnce(true);

      const fileSystem = fileSystems.New({ filters });

      const err = await fileSystem.writeFile(fileHandle, fileContent);
      expect(err).not.toBeNull();
    });
  });
});
