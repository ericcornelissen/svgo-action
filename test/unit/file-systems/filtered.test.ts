import { when, resetAllWhenMocks } from "jest-when";

jest.mock("../../../src/errors");

import errors from "../../../src/errors";

import NewFilteredFileSystem from "../../../src/file-systems/filtered";

describe("file-systems/filtered.ts", () => {
  let fileSystem;
  let baseFs;

  let filter1;
  let filter2;

  beforeAll(() => {
    filter1 = jest.fn().mockName("filter1");
    filter2 = jest.fn().mockName("filter2");

    baseFs = {
      listFiles: jest.fn().mockName("baseFs.listFiles"),
      readFile: jest.fn().mockName("baseFs.readFile"),
      writeFile: jest.fn().mockName("baseFs.writeFile"),
    };
  });

  beforeEach(() => {
    fileSystem = NewFilteredFileSystem({
      fs: baseFs,
      filters: [filter1, filter2],
    });

    filter1.mockReset();
    filter2.mockReset();
    filter1.mockReturnValue(true);
    filter2.mockReturnValue(true);
  });

  describe("::listFiles", () => {
    const file1 = { path: "foo.bar" };
    const file2 = { path: "hello.world" };
    const file3 = { path: "lorem.ipsum" };

    beforeEach(() => {
      baseFs.listFiles.mockClear();

      resetAllWhenMocks();
    });

    test("all filters pass", () => {
      const files = [file1, file2, file3];

      baseFs.listFiles.mockReturnValueOnce(files);

      const result = Array.from(fileSystem.listFiles());
      expect(result).toContain(file1);
      expect(result).toContain(file2);
      expect(result).toContain(file3);
    });

    test.each([
      () => [filter1],
      () => [filter2],
      () => [filter1, filter2],
    ])("some filters don't pass, %#", (getFilters) => {
      const negativeFilters = getFilters();
      const files = [file1, file2, file3];

      baseFs.listFiles.mockReturnValueOnce(files);
      for (const negativeFilter of negativeFilters) {
        negativeFilter.mockReturnValue(false);
      }

      const result = Array.from(fileSystem.listFiles());
      expect(result).toEqual([]);
    });

    test("some files don't pass a filter", () => {
      const files = [file1, file2, file3];

      baseFs.listFiles.mockReturnValueOnce(files);
      when(filter1)
        .mockReturnValue(true)
        .calledWith(file1.path)
        .mockReturnValue(false);
      when(filter2)
        .mockReturnValue(true)
        .calledWith(file3.path)
        .mockReturnValue(false);

      const result = Array.from(fileSystem.listFiles());
      expect(result).toContain(file2);
    });
  });

  describe("::readFile", () => {
    const file = { path: "foo.bar" };

    beforeEach(() => {
      baseFs.readFile.mockReset();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("read not-filtered file, (content: '%s')", async (content) => {
      baseFs.readFile.mockResolvedValueOnce([content, null]);

      const [result, err] = await fileSystem.readFile(file);
      expect(err).toBeNull();
      expect(result).toEqual(content);
    });

    test.each([
      () => [filter1],
      () => [filter2],
      () => [filter1, filter2],
    ])("read filtered file, %#", async (getFilters) => {
      const negativeFilters = getFilters();

      baseFs.readFile.mockResolvedValueOnce(["foobar", null]);
      for (const negativeFilter of negativeFilters) {
        negativeFilter.mockReturnValue(false);
      }

      const [result, err] = await fileSystem.readFile(file);
      expect(err).not.toBeNull();
      expect(err).toContain("no access");
      expect(result).toEqual("");
    });

    test("read error", async () => {
      baseFs.readFile.mockResolvedValueOnce(["", errors.New("read error")]);

      const [, err] = await fileSystem.readFile(file);
      expect(err).not.toBeNull();
    });
  });

  describe("::writeFile", () => {
    const file = { path: "foo.bar" };

    beforeEach(() => {
      baseFs.writeFile.mockReset();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("write not-filtered file (content: '%s')", async (content) => {
      baseFs.writeFile.mockResolvedValueOnce(null);

      const err = await fileSystem.writeFile(file, content);
      expect(err).toBeNull();
    });

    test.each([
      () => [filter1],
      () => [filter2],
      () => [filter1, filter2],
    ])("write filtered file, %#", async (getFilters) => {
      const negativeFilters = getFilters();

      baseFs.writeFile.mockResolvedValueOnce(null);
      for (const negativeFilter of negativeFilters) {
        negativeFilter.mockReturnValue(false);
      }

      const err = await fileSystem.writeFile(file, "foobar");
      expect(err).not.toBeNull();
      expect(err).toContain("no access");
    });

    test("write error", async () => {
      baseFs.writeFile.mockResolvedValueOnce(["", errors.New("write error")]);

      const err = await fileSystem.writeFile(file, "Hello world");
      expect(err).not.toBeNull();
    });
  });
});
