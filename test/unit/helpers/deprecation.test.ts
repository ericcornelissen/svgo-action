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
    expect(core.notice).toHaveBeenCalledWith(
      "General support for SVGO Action v3 ended 2023-09-23. Security " +
      "updates will be supported until 2023-12-31. Please upgrade to SVGO " +
      "Action v4 as soon as possible.",
    );
  });
});
