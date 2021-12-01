import { when, resetAllWhenMocks } from "jest-when";

jest.mock("../../src/file-systems");

import fileSystems from "../../src/file-systems";
import optimize from "../../src/optimize";
import optimizer from "../__common__/optimizer.mock";

describe("package optimize", () => {
  describe("::Files", () => {
    let fs;

    const testCases = [
      [[
        /* no files */
      ]],
      [[
        { path: "foobar.svg" },
      ]],
      [[
        { path: "foo.svg" },
        { path: "bar.svg" },
      ]],
    ];

    beforeAll(() => {
      fs = fileSystems.New({ filters: [] });
    });

    beforeEach(() => {
      fs.listFiles.mockClear();
      fs.readFile.mockClear();
      fs.writeFile.mockClear();

      optimizer.optimize.mockClear();

      resetAllWhenMocks();
    });

    test.each(testCases)("optimize files, %#", async (files) => {
      const config = { isDryRun: { value: false } };

      fs.listFiles.mockReturnValue(files);
      files.forEach((file, i) => {
        when(fs.readFile)
          .calledWith(file)
          .mockReturnValue([`<svg>${i}</svg>`, null]);
      });

      const [stats, err] = await optimize.Files({ config, fs, optimizer });
      expect(err).toBeNull();

      expect(stats.svgCount).toBe(files.length);
      expect(stats.optimizedCount).toBe(files.length);

      expect(optimizer.optimize).toHaveBeenCalledTimes(files.length);
      expect(fs.readFile).toHaveBeenCalledTimes(files.length);
      expect(fs.writeFile).toHaveBeenCalledTimes(files.length);
    });

    test.each(testCases)("dry run enabled, %#", async (files) => {
      const config = { isDryRun: { value: true } };

      fs.listFiles.mockReturnValue(files);

      const [stats, err] = await optimize.Files({ config, fs, optimizer });
      expect(err).toBeNull();

      expect(stats.svgCount).toBe(files.length);
      expect(stats.optimizedCount).toBe(files.length);

      expect(optimizer.optimize).toHaveBeenCalledTimes(files.length);
      expect(fs.readFile).toHaveBeenCalledTimes(files.length);
      expect(fs.writeFile).not.toHaveBeenCalled();
    });
  });
});
