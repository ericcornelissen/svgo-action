import type { Dirent, Stats } from "fs";

import { when, resetAllWhenMocks } from "jest-when";
import { mocked } from "ts-jest/utils";

jest.mock("fs");
jest.mock("path");
jest.mock("../../../src/errors");

import * as _fs from "fs";
import * as _path from "path";

const fs = mocked(_fs);
const path = mocked(_path);

import NewBaseFileSystem from "../../../src/file-systems/base";

describe("file-systems/base.ts", () => {
  let fileSystem;

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
      fs.lstatSync.mockClear();
      fs.readdirSync.mockClear();

      resetAllWhenMocks();
    });

    test("list files", () => {
      const dir = "foo" as unknown as Dirent;
      const dirDir = "bar" as unknown as Dirent;
      const dirFile = "baz" as unknown as Dirent;
      const dirDirFile = "praise-the.sun" as unknown as Dirent;
      const file1 = "hello.world" as unknown as Dirent;
      const file2 = "lorem.ipsum" as unknown as Dirent;

      fs.readdirSync.mockReturnValueOnce([dir, file1, file2]);
      fs.readdirSync.mockReturnValueOnce([dirDir, dirFile]);
      fs.readdirSync.mockReturnValueOnce([dirDirFile]);

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

      fs.readdirSync.mockReset();
      fs.readdirSync.mockReturnValueOnce([dir as unknown as Dirent]);
      fs.readdirSync.mockReturnValueOnce([fileInDir]);
      fs.existsSync.mockReturnValue(true);

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
      fs.existsSync.mockClear();
      fs.readFileSync.mockClear();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("read success (content: '%s')", async (content) => {
      const testFile = file;

      fs.existsSync.mockReturnValueOnce(true);
      fs.readFileSync.mockReturnValueOnce(Buffer.from(content));

      const [, err]  = await fileSystem.readFile(testFile);
      expect(err).toBeNull();

      expect(fs.existsSync).toHaveBeenCalledTimes(1);
      expect(fs.existsSync).toHaveBeenCalledWith(testFile.path);

      expect(fs.readFileSync).toHaveBeenCalledTimes(1);
      expect(fs.readFileSync).toHaveBeenCalledWith(testFile.path);
    });

    test("file doesn't exist", async () => {
      fs.existsSync.mockReturnValueOnce(false);

      const [result, err] = await fileSystem.readFile("foo.bar");
      expect(err).not.toBeNull();
      expect(err).toContain("file not found");
      expect(result).toBe("");
    });

    test("read failure when file exists", async () => {
      fs.existsSync.mockReturnValueOnce(true);
      fs.readFileSync.mockImplementationOnce(() => { throw new Error(); });

      const [result, err]  = await fileSystem.readFile("foo.bar");
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
      fs.writeFileSync.mockClear();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("write success (content: '%s')", async (content) => {
      fs.writeFileSync.mockReturnValueOnce(undefined);

      const err = await fileSystem.writeFile(file, content);
      expect(err).toBeNull();

      expect(fs.writeFileSync).toHaveBeenCalledTimes(1);
      expect(fs.writeFileSync).toHaveBeenCalledWith(file.path, content);
    });

    test("write error", async () => {
      fs.writeFileSync.mockImplementationOnce(() => { throw new Error(); });

      const err = await fileSystem.writeFile(file, "foobar");
      expect(err).not.toBeNull();
      expect(err).toContain("cannot write file");
    });
  });
});
