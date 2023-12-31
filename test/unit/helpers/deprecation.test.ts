jest.mock("@actions/core");

import * as core from "@actions/core";

import {
  deprecationWarnings,
} from "../../../src/helpers/deprecation";

const coreNotice = core.notice as jest.MockedFunction<typeof core.notice>;

describe("helpers/deprecation.ts", () => {
  beforeEach(() => {
    coreNotice.mockClear();
  });

  test("deprecation warning for v3 of the Action", () => {
    deprecationWarnings({ core });
    expect(core.warning).toHaveBeenCalledWith(
      "Support for SVGO Action v3 ended 2023-12-31. Please upgrade to the " +
      "latest version as soon as possible",
    );
  });
});
