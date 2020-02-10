import SVGOptimizer from "../src/svgo";

import * as svgs from "./fixtures/svgs.json";


describe("constructor", () => {

  test("does not throw when given no configuration", () => {
    expect(() => new SVGOptimizer()).not.toThrow();
  });

  test("does not throw when given empty configuration", () => {
    expect(() => new SVGOptimizer({})).not.toThrow();
  });

});

describe(".optimize", () => {

  let optimizer: SVGOptimizer;

  beforeEach(() => {
    optimizer = new SVGOptimizer({});
  });

  test("return a (string) value", async () => {
    const result = await optimizer.optimize(svgs.simple);
    expect(result).toBeDefined();
    expect(typeof result).toBe("string");
  });

  test("change a (not optimized) SVG", async () => {
    const result = await optimizer.optimize(svgs.simple);
    expect(result).not.toEqual(svgs.simple);
  });

});
