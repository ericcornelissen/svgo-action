import { when, resetAllWhenMocks } from "jest-when";

jest.mock("svgo-v1");
jest.mock("../../../../src/errors");

import svgo from "svgo-v1";

import SvgoV1Wrapper from "../../../../src/svgo/v1/wrapper";
import { invalidSvg, optimizedSvg, validSvg } from "../common";

describe("svgo/v1/wrapper.ts", () => {
  describe("::optimize", () => {
    const options = { foo: "bar" };

    let optimize: jest.Mock<Promise<{ data: string }>, [string]>;

    beforeAll(() => {
      const _svgo = new svgo();
      optimize = _svgo.optimize;
    });

    beforeEach(() => {
      optimize.mockClear();

      resetAllWhenMocks();
    });

    test("valid SVG", async () => {
      when(optimize)
        .calledWith(validSvg)
        .mockResolvedValue({ data: optimizedSvg });

      const svgOptimizer = new SvgoV1Wrapper(svgo, options);

      const [result, err] = await svgOptimizer.optimize(validSvg);
      expect(err).toBeNull();
      expect(result).toBe(optimizedSvg);
    });

    test("invalid SVG", async () => {
      const errorMsg = "some message that's probably not in the source code";

      when(optimize)
        .calledWith(invalidSvg)
        .mockRejectedValueOnce(new Error(errorMsg));

      const svgOptimizer = new SvgoV1Wrapper(svgo, options);

      const [result, err] = await svgOptimizer.optimize(invalidSvg);
      expect(err).not.toBeNull();
      expect(err).toContain(errorMsg);
      expect(result).toBe("");
    });
  });
});
