import type { SVGO } from "../../../../src/svgo/v1/types";

jest.mock("../../../../src/errors");
jest.mock("../../../../src/svgo/v1/wrapper");

import svgoV1 from "../../../../src/svgo/v1/index";
import SvgoV1Wrapper from "../../../../src/svgo/v1/wrapper";

const SvgoV1WrapperMock = SvgoV1Wrapper as jest.MockedClass<typeof SvgoV1Wrapper>; // eslint-disable-line max-len

describe("svgo/v1/index.ts", () => {
  beforeEach(() => {
    SvgoV1WrapperMock.mockClear();
  });

  describe("::NewFrom", () => {
    const importedSvgo: SVGO = jest.fn();

    test("create instance successfully with configuration", async () => {
      const options = { foo: "bar" };

      const [result, err] = svgoV1.NewFrom(importedSvgo, options);
      expect(err).toBeNull();
      expect(result).not.toBeNull();
      expect(SvgoV1Wrapper).toHaveBeenCalledWith(importedSvgo, options);
    });
  });
});
