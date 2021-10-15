import { mocked } from "ts-jest/utils";

jest.mock("svgo-v2");
jest.mock("../../../../src/errors");
jest.mock("../../../../src/svgo/v2/wrapper");

import svgo from "svgo-v2";

import _SVGOptimizer from "../../../../src/svgo/v2/wrapper";

const SVGOptimizer = mocked(_SVGOptimizer);

import svgoV2 from "../../../../src/svgo/v2/index";

describe("svgo/v2/index.ts", () => {
  describe("::New", () => {
    beforeEach(() => {
      SVGOptimizer.mockClear();
    });

    test("create instance successfully without configuration", async () => {
      const [result, err] = svgoV2.New();
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizer).toHaveBeenCalledWith(svgo, { });
    });

    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV2.New(options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizer).toHaveBeenCalledWith(svgo, options);
    });
  });
});
