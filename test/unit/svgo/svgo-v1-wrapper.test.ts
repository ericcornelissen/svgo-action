import { when, resetAllWhenMocks } from "jest-when";

import { invalidSvg, optimizedSvg, validSvg } from "./common";

jest.mock("svgo-v1");
jest.mock("../../../src/errors");

import SVGO from "svgo-v1";

import SVGOptimizer from "../../../src/svgo/svgo-v1-wrapper";

describe("svgo/svgo-v1-wrapper.ts", () => {
  describe("::optimize", () => {
    let optimize: jest.Mock<Promise<{ data: string }>, [string]>;

    beforeAll(() => {
      const svgo = new SVGO();
      optimize = svgo.optimize;
    });

    beforeEach(() => {
      optimize.mockClear();

      resetAllWhenMocks();
    });

    test("valid SVG", async () => {
      when(optimize)
        .calledWith(validSvg)
        .mockResolvedValue({ data: optimizedSvg });

      const svgOptimizer = new SVGOptimizer();

      const [result, err] = await svgOptimizer.optimize(validSvg);
      expect(err).toBeNull();
      expect(result).toBe(optimizedSvg);
    });

    test("invalid SVG", async () => {
      const errorMsg = "some message that's probably not in the source code";

      when(optimize)
        .calledWith(invalidSvg)
        .mockRejectedValueOnce(new Error(errorMsg));

      const svgOptimizer = new SVGOptimizer();

      const [, err] = await svgOptimizer.optimize(invalidSvg);
      expect(err).not.toBeNull();
      expect(err).toContain(errorMsg);
    });
  });
});
