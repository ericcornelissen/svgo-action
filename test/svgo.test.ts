import files from "./fixtures/file-data.json";
import svgoV1Options from "./fixtures/svgo-v1-options.json";
import svgoV2Options from "./fixtures/svgo-v2-options.json";

import * as core from "./mocks/@actions/core.mock";
import * as encoder from "./mocks/encoder.mock";
import * as githubAPI from "./mocks/github-api.mock";

jest.mock("@actions/core", () => core);
jest.mock("../src/encoder", () => encoder);
jest.mock("../src/github-api", () => githubAPI);

import { SVGOptimizer, SVGOptions } from "../src/svgo";


const svgs = Object.entries(files)
  .filter(([key, _]) => key !== "fake.svg")
  .filter(([key, _]) => key.endsWith(".svg"))
  .map(([_, value]) => value)
  .slice(0, 4);


describe("SVGOptimizer (v2)", () => {

  describe("::constructor", () => {

    test("does not throw when given no configuration", () => {
      expect(() => new SVGOptimizer(2)).not.toThrow();
    });

    test("does not throw when given empty configuration", () => {
      expect(() => new SVGOptimizer(2, {})).not.toThrow();
    });

    test("does not throw when given configuration", () => {
      expect(() => new SVGOptimizer(2, svgoV2Options as SVGOptions)).not.toThrow();
    });

  });

  describe(".optimize", () => {

    const optimizer: SVGOptimizer = new SVGOptimizer(2, {});

    test.each(svgs)("return a (string) value", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    test.each(svgs)("change a (not optimized) SVG", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).not.toEqual(svg);
    });

    test("return value for a previously optimized SVG", async () => {
      const optimized = await optimizer.optimize(files["test.svg"]);
      const result = await optimizer.optimize(optimized);
      expect(result).toEqual(optimized);
    });

    test("optimizing with different configurations (default vs. fixture)", async () => {
      const optimizer2: SVGOptimizer = new SVGOptimizer(2, svgoV2Options as SVGOptions);

      const optimized1 = await optimizer.optimize(files["complex.svg"]);
      const optimized2 = await optimizer2.optimize(files["complex.svg"]);
      expect(optimized1).not.toEqual(optimized2);
    });

    test("not an svg", async () => {
      const promise = optimizer.optimize(files["fake.svg"]);
      await expect(promise).rejects.toBeDefined();
    });

  });

});

describe("SVGOptimizer (v1)", () => {

  describe("::constructor", () => {

    test("does not throw when given no configuration", () => {
      expect(() => new SVGOptimizer(1)).not.toThrow();
    });

    test("does not throw when given empty configuration", () => {
      expect(() => new SVGOptimizer(1, {})).not.toThrow();
    });

    test("does not throw when given configuration", () => {
      expect(() => new SVGOptimizer(1, svgoV1Options as SVGOptions)).not.toThrow();
    });

  });

  describe(".optimize", () => {

    const optimizer: SVGOptimizer = new SVGOptimizer(1, {});

    test.each(svgs)("return a (string) value", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    test.each(svgs)("change a (not optimized) SVG", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).not.toEqual(svg);
    });

    test("return value for a previously optimized SVG", async () => {
      const optimized = await optimizer.optimize(files["test.svg"]);
      const result = await optimizer.optimize(optimized);
      expect(result).toEqual(optimized);
    });

    test("optimizing with different configurations (default vs. fixture)", async () => {
      const optimizer2: SVGOptimizer = new SVGOptimizer(svgoV1Options as SVGOptions);

      const optimized1 = await optimizer.optimize(files["complex.svg"]);
      const optimized2 = await optimizer2.optimize(files["complex.svg"]);
      expect(optimized1).not.toEqual(optimized2);
    });

    test("not an svg", async () => {
      const promise = optimizer.optimize(files["fake.svg"]);
      await expect(promise).rejects.toBeDefined();
    });

  });

});
