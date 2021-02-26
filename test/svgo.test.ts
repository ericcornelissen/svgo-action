import type { SVGOptions } from "../src/svgo";

import svgs from "./fixtures/svg-files.json";
import svgoV1Options from "./fixtures/svgo-v1-options.json";
import svgoV2Options from "./fixtures/svgo-v2-options.json";

import { SVGOptimizer } from "../src/svgo";


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

    test.each(svgs.notOptimized)("return a (string) value", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    test.each(svgs.notOptimized)("change a (not optimized) SVG", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).not.toEqual(svg);
    });

    test.each(svgs.optimized)("return value for a optimized SVG", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).toEqual(svg);
    });

    test("not an svg", async () => {
      const promise = optimizer.optimize("this is not an SVG");
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

    test.each(svgs.notOptimized)("return a (string) value", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
    });

    test.each(svgs.notOptimized)("change a (not optimized) SVG", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).not.toEqual(svg);
    });

    test.each(svgs.optimized)("return value for a previously optimized SVG", async (svg: string) => {
      const result = await optimizer.optimize(svg);
      expect(result).toEqual(svg);
    });

    test("not an svg", async () => {
      const promise = optimizer.optimize("this is not an SVG");
      await expect(promise).rejects.toBeDefined();
    });

  });

});
