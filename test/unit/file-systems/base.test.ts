import type { Dirent, Stats } from "node:fs";

import { when, resetAllWhenMocks } from "jest-when";

jest.mock("node:fs", () => require("../../__common__/node-fs.mock.ts"));
jest.mock("node:path", () => require("../../__common__/node-path.mock.ts"));
jest.mock("../../../src/errors");

import * as fs from "node:fs";
import * as path from "node:path";

import NewBaseFileSystem from "../../../src/file-systems/base";

const fsExistsSync = fs.existsSync as jest.MockedFunction<typeof fs.existsSync>;
const fsLstatSync = fs.lstatSync as jest.MockedFunction<typeof fs.lstatSync>;
const fsOpenSync = fs.openSync as jest.MockedFunction<typeof fs.openSync>;
const fsReaddirSync = fs.readdirSync as jest.MockedFunction<typeof fs.readdirSync>; // eslint-disable-line max-len
const fsReadFileSync = fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>; // eslint-disable-line max-len
const fsWriteFileSync = fs.writeFileSync as jest.MockedFunction<typeof fs.writeFileSync>; // eslint-disable-line max-len

describe("file-systems/base.ts", () => {
  let fileSystem: ReturnType<typeof NewBaseFileSystem>;

  beforeEach(() => {
    fileSystem = NewBaseFileSystem({ fs, path });
  });

  describe("::listFiles", () => {
    const lstatDir = {
      isFile() { return false; },
    } as Stats;
    const lstatFile = {
      isFile() { return true; },
    } as Stats;

    beforeEach(() => {
      fsLstatSync.mockClear();
      fsReaddirSync.mockClear();

      resetAllWhenMocks();
    });

    test("list files", () => {
      const dir = "foo" as unknown as Dirent;
      const dirDir = "bar" as unknown as Dirent;
      const dirFile = "baz" as unknown as Dirent;
      const dirDirFile = "praise-the.sun" as unknown as Dirent;
      const file1 = "hello.world" as unknown as Dirent;
      const file2 = "lorem.ipsum" as unknown as Dirent;

      fsReaddirSync.mockReturnValueOnce([dir, file1, file2]);
      fsReaddirSync.mockReturnValueOnce([dirDir, dirFile]);
      fsReaddirSync.mockReturnValueOnce([dirDirFile]);

      when(fs.existsSync)
        .mockReturnValue(true)
        .calledWith(`./${dir}/${dirDir}`)
        .mockReturnValue(false);

      when(fs.lstatSync)
        .calledWith(`./${dir}`)
        .mockReturnValueOnce(lstatDir);
      when(fs.lstatSync)
        .calledWith(`./${dir}/${dirDir}`)
        .mockReturnValueOnce(lstatDir);
      when(fs.lstatSync)
        .calledWith(`./${dir}/${dirFile}`)
        .mockReturnValueOnce(lstatFile);
      when(fs.lstatSync)
        .calledWith(`./${file1}`)
        .mockReturnValueOnce(lstatFile);
      when(fs.lstatSync)
        .calledWith(`./${file2}`)
        .mockReturnValueOnce(lstatFile);
      when(fs.lstatSync)
        .calledWith(`./${dir}/${dirDir}/${dirDirFile}`)
        .mockReturnValueOnce(lstatFile);

      const result = Array.from(fileSystem.listFiles());

      expect(result).toHaveLength(3);
      expect(result).toContainEqual({
        path: "foo/baz",
      });
      expect(result).toContainEqual({
        path: "hello.world",
      });
      expect(result).toContainEqual({
        path: "lorem.ipsum",
      });
    });

    test.each([
      ".git",
      "node_modules",
    ])("ignore '%s'", (dir) => {
      const fileInDir = "foo.bar" as unknown as Dirent;

      fsReaddirSync.mockReset();
      fsReaddirSync.mockReturnValueOnce([dir as unknown as Dirent]);
      fsReaddirSync.mockReturnValueOnce([fileInDir]);
      fsExistsSync.mockReturnValue(true);

      when(fs.lstatSync)
        .calledWith(dir)
        .mockReturnValueOnce(lstatDir);
      when(fs.lstatSync)
        .calledWith(`./${fileInDir}`)
        .mockReturnValueOnce(lstatFile);

      const result = Array.from(fileSystem.listFiles());

      expect(result).toEqual([]);
      expect(fs.readdirSync).not.toHaveBeenCalledWith(
        expect.stringContaining(dir),
      );
    });
  });

  describe("::readFile", () => {
    const file = {
      path: "praise/the.sun",
    };

    beforeEach(() => {
      fsOpenSync.mockClear();
      fsReadFileSync.mockClear();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("read success (content: '%s')", async (content) => {
      const testFile = file;
      const fileHandle = content.length;

      fsOpenSync.mockReturnValueOnce(fileHandle);
      fsReadFileSync.mockReturnValueOnce(Buffer.from(content));

      const [, err]  = await fileSystem.readFile(testFile);
      expect(err).toBeNull();

      expect(fs.openSync).toHaveBeenCalledTimes(1);
      expect(fs.openSync).toHaveBeenCalledWith(testFile.path, "r");

      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenCalledWith(fileHandle);
    });

    test("file doesn't exist", async () => {
      fsOpenSync.mockImplementationOnce(() => { throw new Error(); });

      const [result, err] = await fileSystem.readFile({ path: "foo.bar" });
      expect(err).not.toBeNull();
      expect(err).toContain("file not found");
      expect(result).toBe("");
    });

    test("read failure when file exists", async () => {
      fsOpenSync.mockReturnValueOnce(1);
      fsReadFileSync.mockImplementationOnce(() => { throw new Error(); });

      const [result, err]  = await fileSystem.readFile({ path: "foo.bar" });
      expect(err).not.toBeNull();
      expect(err).toContain("cannot read file");
      expect(result).toBe("");
    });
  });

  describe("::writeFile", () => {
    const file = {
      path: "praise/the.sun",
    };

    beforeEach(() => {
      fsOpenSync.mockClear();
      fsWriteFileSync.mockClear();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("write success (content: '%s')", async (content) => {
      const fileHandle = content.length;

      fsOpenSync.mockReturnValueOnce(fileHandle);
      fsWriteFileSync.mockReturnValueOnce(undefined);

      const err = await fileSystem.writeFile(file, content);
      expect(err).toBeNull();

      expect(fs.openSync).toHaveBeenCalledTimes(1);
      expect(fs.openSync).toHaveBeenCalledWith(file.path, "w");

      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      expect(fs.writeFileSync).toHaveBeenCalledWith(fileHandle, content);
    });

    test("write error", async () => {
      fsOpenSync.mockReturnValueOnce(1);
      fsWriteFileSync.mockImplementationOnce(() => { throw new Error(); });

      const err = await fileSystem.writeFile(file, "foobar");
      expect(err).not.toBeNull();
      expect(err).toContain("cannot write file");
    });

    test("open error", async () => {
      fsOpenSync.mockImplementationOnce(() => { throw new Error(); });

      const err = await fileSystem.writeFile(file, "foobar");
      expect(err).not.toBeNull();
      expect(err).toContain("cannot open file");
    });
  });
});
