import { mocked } from "ts-jest/utils";

jest.mock("svgo-v1");
jest.mock("../../../../src/errors");
jest.mock("../../../../src/svgo/v1/wrapper");

import svgo from "svgo-v1";

import svgoV1 from "../../../../src/svgo/v1/index";
import _SvgoV1Wrapper from "../../../../src/svgo/v1/wrapper";

const SvgoV1Wrapper = mocked(_SvgoV1Wrapper);

describe("svgo/v1/index.ts", () => {
  describe("::New", () => {
    beforeEach(() => {
      SvgoV1Wrapper.mockClear();
    });

    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV1.New(options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SvgoV1Wrapper).toHaveBeenCalledWith(svgo, options);
    });
  });

  describe("::NewFrom", () => {
    const importedSvgo = { hello: "world" };

    beforeEach(() => {
      SvgoV1Wrapper.mockClear();
    });

    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV1.NewFrom(importedSvgo, options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SvgoV1Wrapper).toHaveBeenCalledWith(importedSvgo, options);
    });
  });
});
