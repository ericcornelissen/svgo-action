import type { FileInfo } from "../src/file-system";

import * as fs from "./mocks/file-system.mock";
import * as inputs from "./mocks/inputs.mock";
import * as svgoImport from "./mocks/svgo.mock";

import { optimize } from "../src/optimize";

const svgo = new svgoImport.SVGOptimizer();

describe("::optimize", () => {
  describe.each([false, true])("dry run = %s", (dryRun) => {
    const folderContainingTwoSvgs = "/path/to/two/svgs";

    const nonSvgFile: FileInfo = {
      path: "/path/to/foo.bar",
      extension: ".bar",
    };
    const svgFile1: FileInfo = {
      path: `${folderContainingTwoSvgs}/foo.svg`,
      extension: ".svg",
    };
    const svgFile2: FileInfo = {
      path: `${folderContainingTwoSvgs}/bar.svg`,
      extension: ".svg",
    };
    const svgFile3: FileInfo = {
      path: "/unique/path/foo.svg",
      extension: ".svg",
    };
    const svgFile4: FileInfo = {
      path: "/unique/path/bar.svg",
      extension: ".svg",
    };

    let config;

    beforeEach(() => {
      fs.listFiles.mockClear();
      fs.readFile.mockClear();
      fs.writeFile.mockClear();

      svgo.optimize.mockClear();
    });

    beforeEach(() => {
      config = new inputs.ActionConfig();
      config.isDryRun = dryRun;
    });

    test("no files", async () => {
      fs.listFiles.mockReturnValueOnce([]);

      const result = await optimize(fs, config, svgo);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();

      expect(svgo.optimize).not.toHaveBeenCalled();

      expect(result.optimizedCount).toEqual(0);
      expect(result.skippedCount).toEqual(0);
      expect(result.svgCount).toEqual(0);
    });

    test("one non-svg files", async () => {
      fs.listFiles.mockReturnValueOnce([nonSvgFile]);

      const result = await optimize(fs, config, svgo);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).not.toHaveBeenCalled();
      expect(fs.writeFile).not.toHaveBeenCalled();

      expect(svgo.optimize).not.toHaveBeenCalled();

      expect(result.optimizedCount).toEqual(0);
      expect(result.skippedCount).toEqual(0);
      expect(result.svgCount).toEqual(0);
    });

    test("one SVG file", async () => {
      fs.listFiles.mockReturnValueOnce([svgFile1]);

      const result = await optimize(fs, config, svgo);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : 1);

      expect(svgo.optimize).toHaveBeenCalledTimes(1);

      expect(result.optimizedCount).toEqual(1);
      expect(result.skippedCount).toEqual(0);
      expect(result.svgCount).toEqual(1);
    });

    test("one optimized SVG file", async () => {
      fs.listFiles.mockReturnValueOnce([svgFile2]);

      const svgo = new svgoImport.SVGOptimizer();
      svgo.optimize.mockImplementationOnce(async (svg) => svg);

      const result = await optimize(fs, config, svgo);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledTimes(0);

      expect(svgo.optimize).toHaveBeenCalledTimes(1);

      expect(result.optimizedCount).toEqual(0);
      expect(result.skippedCount).toEqual(1); // TODO: update skipped count logic
      expect(result.svgCount).toEqual(1);
    });

    test("one non-SVG file and one SVG file", async () => {
      fs.listFiles.mockReturnValueOnce([nonSvgFile, svgFile1]);

      const result = await optimize(fs, config, svgo);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : 1);

      expect(svgo.optimize).toHaveBeenCalledTimes(1);

      expect(result.optimizedCount).toEqual(1);
      expect(result.skippedCount).toEqual(0);
      expect(result.svgCount).toEqual(1);
    });

    test("one SVG file and one non-SVG file", async () => {
      fs.listFiles.mockReturnValueOnce([svgFile1, nonSvgFile]);

      const result = await optimize(fs, config, svgo);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledTimes(1);
      expect(fs.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : 1);

      expect(svgo.optimize).toHaveBeenCalledTimes(1);

      expect(result.optimizedCount).toEqual(1);
      expect(result.skippedCount).toEqual(0);
      expect(result.svgCount).toEqual(1);
    });

    test("multiple SVG files", async () => {
      const files = [
        svgFile1,
        svgFile2,
        svgFile3,
      ];
      const optimizedCount = files.length;

      fs.listFiles.mockReturnValueOnce(files);

      const result = await optimize(fs, config, svgo);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledTimes(optimizedCount);
      expect(fs.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : optimizedCount);

      expect(svgo.optimize).toHaveBeenCalledTimes(optimizedCount);

      expect(result.optimizedCount).toEqual(optimizedCount);
      expect(result.skippedCount).toEqual(0);
      expect(result.svgCount).toEqual(files.length);
    });

    test("multiple SVG files and non-SVG files", async () => {
      const files = [
        svgFile1,
        nonSvgFile,
        svgFile2,
        svgFile3,
      ];
      const nonSvgFileCount = 1;
      const optimizedCount = files.length - nonSvgFileCount;

      fs.listFiles.mockReturnValueOnce(files);

      const result = await optimize(fs, config, svgo);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledTimes(optimizedCount);
      expect(fs.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : optimizedCount);

      expect(svgo.optimize).toHaveBeenCalledTimes(optimizedCount);

      expect(result.optimizedCount).toEqual(optimizedCount);
      expect(result.skippedCount).toEqual(0);
      expect(result.svgCount).toEqual(files.length - nonSvgFileCount);
    });

    test("multiple SVG files, some ignored, and non-SVG files", async () => {
      config.ignoreGlob = `${folderContainingTwoSvgs}/*.svg`;

      const files = [
        svgFile1,
        svgFile2,
        nonSvgFile,
        svgFile3,
        svgFile4,
      ];
      const nonSvgFileCount = 1;
      const ignoredCount = 2;
      const optimizedCount = files.length - ignoredCount - nonSvgFileCount;

      fs.listFiles.mockReturnValueOnce(files);

      const result = await optimize(fs, config, svgo);

      expect(fs.listFiles).toHaveBeenCalledTimes(1);
      expect(fs.readFile).toHaveBeenCalledTimes(optimizedCount);
      expect(fs.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : optimizedCount);

      expect(svgo.optimize).toHaveBeenCalledTimes(optimizedCount);

      expect(result.optimizedCount).toEqual(optimizedCount);
      expect(result.skippedCount).toEqual(2);
      expect(result.svgCount).toEqual(files.length - nonSvgFileCount);
    });
  });
});
