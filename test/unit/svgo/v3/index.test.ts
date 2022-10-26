import type { SVGO } from "../../../../src/svgo/v2/types";

jest.mock("svgo-v3");
jest.mock("../../../../src/errors");
jest.mock("../../../../src/svgo/v2/wrapper");

import svgo from "svgo-v3"; // eslint-disable-line import/default

import SvgoV3Wrapper from "../../../../src/svgo/v2/wrapper";
import svgoV3 from "../../../../src/svgo/v3/index";

const SvgoV3WrapperMock = SvgoV3Wrapper as jest.MockedClass<typeof SvgoV3Wrapper>; // eslint-disable-line max-len

describe("svgo/v3/index.ts", () => {
  beforeEach(() => {
    SvgoV3WrapperMock.mockClear();
  });

  describe("::New", () => {
    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV3.New(options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SvgoV3Wrapper).toHaveBeenCalledWith(svgo, options);
    });
  });

  describe("::NewFrom", () => {
    const importedSvgo: SVGO = {
      optimize: jest.fn(),
    };

    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV3.NewFrom(importedSvgo, options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SvgoV3Wrapper).toHaveBeenCalledWith(importedSvgo, options);
    });
  });
});
