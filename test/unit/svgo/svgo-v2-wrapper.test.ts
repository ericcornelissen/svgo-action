import { when, resetAllWhenMocks } from "jest-when";

import { invalidSvg, optimizedSvg, validSvg } from "./common";

jest.mock("svgo-v2");
jest.mock("../../../src/errors");

import svgo from "svgo-v2";

import SVGOptimizer from "../../../src/svgo/svgo-v2-wrapper";

describe("svgo/svgo-v2-wrapper.ts", () => {
  describe("::optimize", () => {
    beforeEach(() => {
      svgo.optimize.mockClear();

      resetAllWhenMocks();
    });

    test("valid SVG", async () => {
      when(svgo.optimize)
        .calledWith(validSvg, expect.anything())
        .mockReturnValue({ data: optimizedSvg });

      const svgOptimizer = new SVGOptimizer();

      const [result, err] = await svgOptimizer.optimize(validSvg);
      expect(err).toBeNull();
      expect(result).toBeDefined();
    });

    test("invalid SVG", async () => {
      when(svgo.optimize)
        .calledWith(invalidSvg, expect.anything())
        .mockReturnValueOnce({ data: "" });

      const svgOptimizer = new SVGOptimizer();

      const [result, err] = await svgOptimizer.optimize(invalidSvg);
      expect(err).not.toBeNull();
      expect(err).toContain("invalid");
      expect(result).toEqual("");
    });

    test("optimization error", async () => {
      const errorMsg = "some message that's probably not in the source code";

      when(svgo.optimize)
        .calledWith(invalidSvg, expect.anything())
        .mockImplementationOnce(() => {
          throw new Error(errorMsg);
        });

      const svgOptimizer = new SVGOptimizer();

      const [result, err] = await svgOptimizer.optimize(invalidSvg);
      expect(err).not.toBeNull();
      expect(err).toContain(errorMsg);
      expect(result).toEqual("");
    });
  });
});
