const fsMock = {
  // https://nodejs.org/api/fs.html#fs_fs_existssync_path
  existsSync: jest.fn()
    .mockReturnValue(false)
    .mockName("fs.existsSync"),

  // https://nodejs.org/api/fs.html#fs_fs_lstatsync_path_options
  lstatSync: jest.fn()
    .mockReturnValue({ isFile() { return true; } })
    .mockName("fs.lstatSync"),

  // https://nodejs.org/api/fs.html#fs_fs_readdirsync_path_options
  readdirSync: jest.fn()
    .mockReturnValue([])
    .mockName("fs.readFileSync"),

  // https://nodejs.org/api/fs.html#fs_fs_readfilesync_path_options
  readFileSync: jest.fn()
    .mockReturnValue(Buffer.from("foobar"))
    .mockName("fs.readFileSync"),

  // https://nodejs.org/api/fs.html#fs_fs_writefilesync_file_data_options
  writeFileSync: jest.fn()
    .mockReturnValue(undefined)
    .mockName("fs.writeFileSync"),
};
const pathMock = {
  // https://nodejs.org/api/path.html#path_path_extname_path
  extname: jest.fn()
    .mockReturnValue("svg")
    .mockName("path.extname"),

  // https://nodejs.org/api/path.html#path_path_resolve_paths
  resolve: jest.fn()
    .mockImplementation((...args) => args.join("/"))
    .mockName("path.resolve"),
};

jest.mock("fs", () => fsMock);
jest.mock("path", () => pathMock);

import { when, resetAllWhenMocks } from "jest-when";

import { BaseFileSystem } from "../../../src/file-systems/base";

describe("file-system/base.ts", () => {
  const file = {
    path: "praise/the.sun",
    extension: "sun",
  };

  describe("::listFiles", () => {
    const lstatDir = { isFile() { return false; } };
    const lstatFile = { isFile() { return true; } };

    beforeEach(() => {
      fsMock.lstatSync.mockClear();
      fsMock.readdirSync.mockClear();

      resetAllWhenMocks();
    });

    test("list files", () => {
      const dir = "foo";
      const dirDir = "bar";
      const dirFile = "baz";
      const file1 = "hello.world";
      const file2 = "lorem.ipsum";

      fsMock.readdirSync.mockReturnValueOnce([dir, file1, file2]);
      fsMock.readdirSync.mockReturnValueOnce([dirDir, dirFile]);
      fsMock.readdirSync.mockReturnValueOnce([]);

      when(fsMock.existsSync)
        .mockReturnValue(true)
        .calledWith(`./${dir}/${dirDir}`)
        .mockReturnValue(false);

      when(fsMock.lstatSync)
        .calledWith(`./${dir}`)
        .mockReturnValueOnce(lstatDir);
      when(fsMock.lstatSync)
        .calledWith(`./${dir}/${dirDir}`)
        .mockReturnValueOnce(lstatDir);
      when(fsMock.lstatSync)
        .calledWith(`./${dir}/${dirFile}`)
        .mockReturnValueOnce(lstatFile);
      when(fsMock.lstatSync)
        .calledWith(`./${file1}`)
        .mockReturnValueOnce(lstatFile);
      when(fsMock.lstatSync)
        .calledWith(`./${file2}`)
        .mockReturnValueOnce(lstatFile);

      const result = Array.from(BaseFileSystem.listFiles("."));

      expect(result).toContainEqual({
        path: "./foo/baz",
        extension: "svg",
      });
      expect(result).toContainEqual({
        path: "./hello.world",
        extension: "svg",
      });
      expect(result).toContainEqual({
        path: "./lorem.ipsum",
        extension: "svg",
      });
    });

    test.each([
      ".git",
      "node_modules",
      "vendor",
    ])("ignore '%s'", (dir) => {
      fsMock.readdirSync.mockReturnValueOnce([dir]);

      const result = Array.from(BaseFileSystem.listFiles("."));

      expect(result).toEqual([]);
    });
  });

  describe("::readFile", () => {
    beforeEach(() => {
      fsMock.existsSync.mockClear();
      fsMock.readFileSync.mockClear();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("read success, file is string", async (content) => {
      const filePath = file.path;

      fsMock.existsSync.mockReturnValueOnce(true);
      fsMock.readFileSync.mockReturnValueOnce(Buffer.from(content));

      const [, err]  = await BaseFileSystem.readFile(filePath);
      expect(err).toBeNull();

      expect(fsMock.existsSync).toHaveBeenCalledTimes(1);
      expect(fsMock.existsSync).toHaveBeenCalledWith(filePath);

      expect(fsMock.readFileSync).toHaveBeenCalledTimes(1);
      expect(fsMock.readFileSync).toHaveBeenCalledWith(filePath);
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("read success, file is FileInfo", async (content) => {
      const testFile = file;

      fsMock.existsSync.mockReturnValueOnce(true);
      fsMock.readFileSync.mockReturnValueOnce(Buffer.from(content));

      const [, err]  = await BaseFileSystem.readFile(testFile);
      expect(err).toBeNull();

      expect(fsMock.existsSync).toHaveBeenCalledTimes(1);
      expect(fsMock.existsSync).toHaveBeenCalledWith(testFile.path);

      expect(fsMock.readFileSync).toHaveBeenCalledTimes(1);
      expect(fsMock.readFileSync).toHaveBeenCalledWith(testFile.path);
    });

    test("file doesn't exist", async () => {
      fsMock.existsSync.mockReturnValueOnce(false);

      const [, err] = await BaseFileSystem.readFile("foo.bar");
      expect(err).not.toBeNull();
    });

    test("read failure", async () => {
      fsMock.existsSync.mockReturnValueOnce(true);
      fsMock.readFileSync.mockImplementationOnce(() => { throw new Error(); });

      const [, err]  = await BaseFileSystem.readFile("foo.bar");
      expect(err).not.toBeNull();
    });
  });

  describe("::writeFile", () => {
    beforeEach(() => {
      fsMock.writeFileSync.mockClear();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("write success (%s)", async (content) => {
      const err = await BaseFileSystem.writeFile(file, content);
      expect(err).toBeNull();

      expect(fsMock.writeFileSync).toHaveBeenCalledTimes(1);
      expect(fsMock.writeFileSync).toHaveBeenCalledWith(
        file.path,
        content,
      );
    });

    test("write failure", async () => {
      fsMock.writeFileSync.mockImplementationOnce(() => { throw new Error(); });

      const err = await BaseFileSystem.writeFile(file, "foobar");
      expect(err).not.toBeNull();
    });
  });
});
