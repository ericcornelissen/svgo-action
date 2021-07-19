import type { FileInfo } from "../src/file-systems";

import * as fileSystems from "./mocks/file-systems.mock";
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
      fileSystems.listFiles.mockClear();
      fileSystems.readFile.mockClear();
      fileSystems.writeFile.mockClear();

      svgo.optimize.mockClear();
    });

    beforeEach(() => {
      config = new inputs.ActionConfig();
      config.isDryRun = dryRun;
    });

    test("no files", async () => {
      fileSystems.listFiles.mockReturnValueOnce([]);

      const result = await optimize(fileSystems, config, svgo);

      expect(fileSystems.listFiles).toHaveBeenCalledTimes(1);
      expect(fileSystems.readFile).not.toHaveBeenCalled();
      expect(fileSystems.writeFile).not.toHaveBeenCalled();

      expect(svgo.optimize).not.toHaveBeenCalled();

      expect(result.ignoredCount).toEqual(0);
      expect(result.optimizedCount).toEqual(0);
      expect(result.svgCount).toEqual(0);
    });

    test("one non-svg files", async () => {
      fileSystems.listFiles.mockReturnValueOnce([nonSvgFile]);

      const result = await optimize(fileSystems, config, svgo);

      expect(fileSystems.listFiles).toHaveBeenCalledTimes(1);
      expect(fileSystems.readFile).not.toHaveBeenCalled();
      expect(fileSystems.writeFile).not.toHaveBeenCalled();

      expect(svgo.optimize).not.toHaveBeenCalled();

      expect(result.ignoredCount).toEqual(0);
      expect(result.optimizedCount).toEqual(0);
      expect(result.svgCount).toEqual(0);
    });

    test("one SVG file", async () => {
      fileSystems.listFiles.mockReturnValueOnce([svgFile1]);

      const result = await optimize(fileSystems, config, svgo);

      expect(fileSystems.listFiles).toHaveBeenCalledTimes(1);
      expect(fileSystems.readFile).toHaveBeenCalledTimes(1);
      expect(fileSystems.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : 1);

      expect(svgo.optimize).toHaveBeenCalledTimes(1);

      expect(result.ignoredCount).toEqual(0);
      expect(result.optimizedCount).toEqual(1);
      expect(result.svgCount).toEqual(1);
    });

    test("one optimized SVG file", async () => {
      fileSystems.listFiles.mockReturnValueOnce([svgFile2]);

      const svgo = new svgoImport.SVGOptimizer();
      svgo.optimize.mockImplementationOnce(async (svg) => svg);

      const result = await optimize(fileSystems, config, svgo);

      expect(fileSystems.listFiles).toHaveBeenCalledTimes(1);
      expect(fileSystems.readFile).toHaveBeenCalledTimes(1);
      expect(fileSystems.writeFile).toHaveBeenCalledTimes(0);

      expect(svgo.optimize).toHaveBeenCalledTimes(1);

      expect(result.ignoredCount).toEqual(0);
      expect(result.optimizedCount).toEqual(0);
      expect(result.svgCount).toEqual(1);
    });

    test("one non-SVG file and one SVG file", async () => {
      fileSystems.listFiles.mockReturnValueOnce([nonSvgFile, svgFile1]);

      const result = await optimize(fileSystems, config, svgo);

      expect(fileSystems.listFiles).toHaveBeenCalledTimes(1);
      expect(fileSystems.readFile).toHaveBeenCalledTimes(1);
      expect(fileSystems.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : 1);

      expect(svgo.optimize).toHaveBeenCalledTimes(1);

      expect(result.ignoredCount).toEqual(0);
      expect(result.optimizedCount).toEqual(1);
      expect(result.svgCount).toEqual(1);
    });

    test("one SVG file and one non-SVG file", async () => {
      fileSystems.listFiles.mockReturnValueOnce([svgFile1, nonSvgFile]);

      const result = await optimize(fileSystems, config, svgo);

      expect(fileSystems.listFiles).toHaveBeenCalledTimes(1);
      expect(fileSystems.readFile).toHaveBeenCalledTimes(1);
      expect(fileSystems.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : 1);

      expect(svgo.optimize).toHaveBeenCalledTimes(1);

      expect(result.ignoredCount).toEqual(0);
      expect(result.optimizedCount).toEqual(1);
      expect(result.svgCount).toEqual(1);
    });

    test("multiple SVG files", async () => {
      const files = [
        svgFile1,
        svgFile2,
        svgFile3,
      ];
      const optimizedCount = files.length;

      fileSystems.listFiles.mockReturnValueOnce(files);

      const result = await optimize(fileSystems, config, svgo);

      expect(fileSystems.listFiles).toHaveBeenCalledTimes(1);
      expect(fileSystems.readFile).toHaveBeenCalledTimes(optimizedCount);
      expect(fileSystems.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : optimizedCount);

      expect(svgo.optimize).toHaveBeenCalledTimes(optimizedCount);

      expect(result.ignoredCount).toEqual(0);
      expect(result.optimizedCount).toEqual(optimizedCount);
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

      fileSystems.listFiles.mockReturnValueOnce(files);

      const result = await optimize(fileSystems, config, svgo);

      expect(fileSystems.listFiles).toHaveBeenCalledTimes(1);
      expect(fileSystems.readFile).toHaveBeenCalledTimes(optimizedCount);
      expect(fileSystems.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : optimizedCount);

      expect(svgo.optimize).toHaveBeenCalledTimes(optimizedCount);

      expect(result.ignoredCount).toEqual(0);
      expect(result.optimizedCount).toEqual(optimizedCount);
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

      fileSystems.listFiles.mockReturnValueOnce(files);

      const result = await optimize(fileSystems, config, svgo);

      expect(fileSystems.listFiles).toHaveBeenCalledTimes(1);
      expect(fileSystems.readFile).toHaveBeenCalledTimes(optimizedCount);
      expect(fileSystems.writeFile).toHaveBeenCalledTimes(dryRun ? 0 : optimizedCount);

      expect(svgo.optimize).toHaveBeenCalledTimes(optimizedCount);

      expect(result.ignoredCount).toEqual(ignoredCount);
      expect(result.optimizedCount).toEqual(optimizedCount);
      expect(result.svgCount).toEqual(files.length - nonSvgFileCount);
    });
  });
});
