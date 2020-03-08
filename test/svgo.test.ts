import files from "./fixtures/file-data.json";
import svgoOptions from "./fixtures/svgo-options.json";

import * as core from "./mocks/@actions/core.mock";
import * as encoder from "./mocks/encoder.mock";
import * as githubAPI from "./mocks/github-api.mock";

jest.mock("@actions/core", () => core);
jest.mock("../src/encoder", () => encoder);
jest.mock("../src/github-api", () => githubAPI);

import { SVGOptimizer, SVGOptions } from "../src/svgo";


describe("SVGOptimizer", () => {

  describe("::constructor", () => {

    test("does not throw when given no configuration", () => {
      expect(() => new SVGOptimizer()).not.toThrow();
    });

    test("does not throw when given empty configuration", () => {
      expect(() => new SVGOptimizer({ })).not.toThrow();
    });

    test("does not throw when given configuration", () => {
      expect(() => new SVGOptimizer(svgoOptions as SVGOptions)).not.toThrow();
    });

  });

  describe(".optimize", () => {

    const testSvgs = test.each(
      Object.entries(files)
        .filter(([key, _]) => key.endsWith(".svg"))
        .map(([_, value]) => value)
        .slice(0, 4),
    );

    const optimizer: SVGOptimizer = new SVGOptimizer({ });

    testSvgs("return a (string) value", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    testSvgs("change a (not optimized) SVG", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).not.toEqual(svg);
    });

    test("return value for a previously optimized SVG", async () => {
      const optimized = await optimizer.optimize(files["test.svg"]);
      const result = await optimizer.optimize(optimized);
      expect(result).toEqual(optimized);
    });

    test("optimizing with different configurations (default vs. fixture)", async () => {
      const optimizer2: SVGOptimizer = new SVGOptimizer(svgoOptions as SVGOptions);

      const optimized1 = await optimizer.optimize(files["complex.svg"]);
      const optimized2 = await optimizer2.optimize(files["complex.svg"]);
      expect(optimized1).not.toEqual(optimized2);
    });

  });

});
