// SPDX-License-Identifier: MIT

jest.mock("@actions/core");

import * as core from "@actions/core";

import {
  deprecationWarnings,
} from "../../../src/helpers/deprecation";

const coreError = core.error as jest.MockedFunction<typeof core.error>;

describe("helpers/deprecation.ts", () => {
  beforeEach(() => {
    coreError.mockClear();
  });

  test("deprecation warning for v3 of the Action", () => {
    deprecationWarnings({ core });
    expect(core.error).toHaveBeenCalledWith(
      "Support for SVGO Action ended 2024-04-30. We recommend finding an " +
      "alternative and to not start nor continue using this Action.",
    );
  });
});
