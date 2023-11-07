// SPDX-License-Identifier: MIT

jest.mock("../../../src/errors");

import StubSVGOptimizer from "../../../src/svgo/stub";

describe("svgo/stub.ts", () => {
  describe("::StubSVGOptimizer", () => {
    const svg = "<svg></svg>";

    test("return a string for the first result", async () => {
      const [result] = await StubSVGOptimizer.optimize(svg);
      expect(result).not.toBeNull();
    });

    test("returns an error", async () => {
      const [, err] = await StubSVGOptimizer.optimize(svg);
      expect(err).not.toBeNull();
      expect(err).toBe("invalid SVGOptimizer instance");
    });
  });
});
