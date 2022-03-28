import type { SVGO } from "../../../../src/svgo/v2/types";

jest.mock("svgo-v2");
jest.mock("../../../../src/errors");
jest.mock("../../../../src/svgo/v2/wrapper");

import svgo from "svgo-v2"; // eslint-disable-line import/default

import svgoV2 from "../../../../src/svgo/v2/index";
import SvgoV2Wrapper from "../../../../src/svgo/v2/wrapper";

const SvgoV2WrapperMock = SvgoV2Wrapper as jest.MockedClass<typeof SvgoV2Wrapper>; // eslint-disable-line max-len

describe("svgo/v2/index.ts", () => {
  beforeEach(() => {
    SvgoV2WrapperMock.mockClear();
  });

  describe("::New", () => {
    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV2.New(options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SvgoV2Wrapper).toHaveBeenCalledWith(svgo, options);
    });
  });

  describe("::NewFrom", () => {
    const importedSvgo: SVGO = {
      optimize: jest.fn(),
    };

    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV2.NewFrom(importedSvgo, options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SvgoV2Wrapper).toHaveBeenCalledWith(importedSvgo, options);
    });
  });
});
