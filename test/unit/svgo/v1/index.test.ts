import { mocked } from "ts-jest/utils";

jest.mock("svgo-v1");
jest.mock("../../../../src/errors");
jest.mock("../../../../src/svgo/v1/wrapper");

import svgo from "svgo-v1";

import _SVGOptimizer from "../../../../src/svgo/v1/wrapper";

const SVGOptimizer = mocked(_SVGOptimizer);

import svgoV1 from "../../../../src/svgo/v1/index";

describe("svgo/v1/index.ts", () => {
  describe("::New", () => {
    beforeEach(() => {
      SVGOptimizer.mockClear();
    });

    test("create instance successfully without configuration", async () => {
      const [result, err] = svgoV1.New();
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizer).toHaveBeenCalledWith(svgo, { });
    });

    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV1.New(options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SVGOptimizer).toHaveBeenCalledWith(svgo, options);
    });
  });
});
