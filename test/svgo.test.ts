import { SVGOptimizer } from "../src/svgo";

import svgoConfig from "./fixtures/svgo-config.json";
import svgs from "./fixtures/svgs.json";


describe("constructor", () => {

  test("does not throw when given no configuration", () => {
    expect(() => new SVGOptimizer()).not.toThrow();
  });

  test("does not throw when given empty configuration", () => {
    expect(() => new SVGOptimizer({})).not.toThrow();
  });

  test("does not throw when given configuration", () => {
    expect(() => new SVGOptimizer(svgoConfig)).not.toThrow();
  });

});

describe(".optimize", () => {

  const testSvgs = test.each(Object.values(svgs));

  const optimizer: SVGOptimizer = new SVGOptimizer({});

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
    const optimized = await optimizer.optimize(svgs["test.svg"]);
    const result = await optimizer.optimize(optimized);
    expect(result).toEqual(optimized);
  });

  test("optimizing with different configurations (default vs. fixture)", async () => {
    const optimizer2: SVGOptimizer = new SVGOptimizer(svgoConfig);

    const optimized1 = await optimizer.optimize(svgs.complex);
    const optimized2 = await optimizer2.optimize(svgs.complex);
    expect(optimized1).not.toEqual(optimized2);
  });

});
