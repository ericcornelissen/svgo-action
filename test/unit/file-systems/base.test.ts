const fs = {
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
const path = {
  // https://nodejs.org/api/path.html#path_path_extname_path
  extname: jest.fn()
    .mockReturnValue("svg")
    .mockName("path.extname"),

  // https://nodejs.org/api/path.html#path_path_resolve_paths
  resolve: jest.fn()
    .mockImplementation((...args) => args.join("/"))
    .mockName("path.resolve"),
};

import { when, resetAllWhenMocks } from "jest-when";

import NewBaseFileSystem from "../../../src/file-systems/base";

describe("file-system/base.ts", () => {
  const file = {
    path: "praise/the.sun",
    extension: "sun",
  };

  let fileSystem;

  beforeEach(() => {
    fileSystem = NewBaseFileSystem({ fs, path });
  });

  describe("::listFiles", () => {
    const lstatDir = { isFile() { return false; } };
    const lstatFile = { isFile() { return true; } };

    beforeEach(() => {
      fs.lstatSync.mockClear();
      fs.readdirSync.mockClear();

      resetAllWhenMocks();
    });

    test("list files", () => {
      const dir = "foo";
      const dirDir = "bar";
      const dirFile = "baz";
      const file1 = "hello.world";
      const file2 = "lorem.ipsum";

      fs.readdirSync.mockReturnValueOnce([dir, file1, file2]);
      fs.readdirSync.mockReturnValueOnce([dirDir, dirFile]);
      fs.readdirSync.mockReturnValueOnce([]);

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

      const result = Array.from(fileSystem.listFiles("."));

      expect(result).toContainEqual({
        path: "foo/baz",
        extension: "svg",
      });
      expect(result).toContainEqual({
        path: "hello.world",
        extension: "svg",
      });
      expect(result).toContainEqual({
        path: "lorem.ipsum",
        extension: "svg",
      });
    });

    test.each([
      ".git",
      "node_modules",
    ])("ignore '%s'", (dir) => {
      fs.readdirSync.mockReturnValueOnce([dir]);

      const result = Array.from(fileSystem.listFiles());

      expect(result).toEqual([]);
      expect(fs.readdirSync).not.toHaveBeenCalledWith(
        expect.stringContaining(dir),
      );
    });
  });

  describe("::readFile", () => {
    beforeEach(() => {
      fs.existsSync.mockClear();
      fs.readFileSync.mockClear();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("read success", async (content) => {
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

      const [, err] = await fileSystem.readFile("foo.bar");
      expect(err).not.toBeNull();
    });

    test("read failure (file exists)", async () => {
      fs.existsSync.mockReturnValueOnce(true);
      fs.readFileSync.mockImplementationOnce(() => { throw new Error(); });

      const [, err]  = await fileSystem.readFile("foo.bar");
      expect(err).not.toBeNull();
    });
  });

  describe("::writeFile", () => {
    beforeEach(() => {
      fs.writeFileSync.mockClear();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("write success (%s)", async (content) => {
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
    });
  });
});
