// SPDX-License-Identifier: MIT

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
      "Support for SVGO Action, in general, will end 2024-04-30. We recommend" +
      "finding an alternative before then and to stop using this Action.",
    );
  });
});
