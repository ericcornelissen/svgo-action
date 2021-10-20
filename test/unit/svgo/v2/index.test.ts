import { mocked } from "ts-jest/utils";

jest.mock("svgo-v2");
jest.mock("../../../../src/errors");
jest.mock("../../../../src/svgo/v2/wrapper");

import svgo from "svgo-v2";

import _SvgoV2Wrapper from "../../../../src/svgo/v2/wrapper";

const SvgoV2Wrapper = mocked(_SvgoV2Wrapper);

import svgoV2 from "../../../../src/svgo/v2/index";

describe("svgo/v2/index.ts", () => {
  describe("::New", () => {
    beforeEach(() => {
      SvgoV2Wrapper.mockClear();
    });

    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV2.New(options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SvgoV2Wrapper).toHaveBeenCalledWith(svgo, options);
    });
  });

  describe("::NewFrom", () => {
    const importedSvgo = { hello: "world" };

    beforeEach(() => {
      SvgoV2Wrapper.mockClear();
    });

    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV2.NewFrom(importedSvgo, options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SvgoV2Wrapper).toHaveBeenCalledWith(importedSvgo, options);
    });
  });
});
