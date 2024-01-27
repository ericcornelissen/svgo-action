// SPDX-License-Identifier: MIT

jest.mock("@actions/core");

import * as core from "@actions/core";

import {
  deprecationWarnings,
} from "../../../src/helpers/deprecation";

const coreWarning = core.warning as jest.MockedFunction<typeof core.warning>;

describe("helpers/deprecation.ts", () => {
  beforeEach(() => {
    coreWarning.mockClear();
  });

  test("deprecation warning for v3 of the Action", () => {
    deprecationWarnings({ core });
    expect(core.warning).toHaveBeenCalledWith(
      "Support for SVGO Action, in general, will end 2024-04-30. We recommend" +
      "finding an alternative before then and to stop using this Action.",
    );
  });
});
