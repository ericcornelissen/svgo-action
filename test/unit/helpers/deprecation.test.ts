import type { SupportedSvgoVersions } from "../../../src/svgo";

jest.mock("@actions/core");

import * as core from "@actions/core";

import {
  deprecationWarnings,
} from "../../../src/helpers/deprecation";

const coreNotice = core.notice as jest.MockedFunction<typeof core.notice>;
const coreWarning = core.warning as jest.MockedFunction<typeof core.warning>;

describe("helpers/deprecation.ts", () => {
  beforeEach(() => {
    coreNotice.mockClear();
    coreWarning.mockClear();
  });

  test.each([
    "1",
    "2",
    "project",
  ])("deprecated for the Action (SVGO: '%s')", (svgoVersion) => {
    const config = {
      svgoVersion: {
        value: svgoVersion as SupportedSvgoVersions,
      },
    };

    deprecationWarnings({ config, core });
    expect(core.notice).toHaveBeenCalledWith(
      "Support for SVGO Action v2 ended 2023-04-30. Please upgrade to the " +
      "latest version as soon as possible",
    );
  });

  test.each([
    "2",
    "project",
  ])("no deprecated for SVGO version '%s'", (svgoVersion) => {
    const config = {
      svgoVersion: {
        value: svgoVersion as SupportedSvgoVersions,
      },
    };

    deprecationWarnings({ config, core });
    expect(core.warning).not.toHaveBeenCalled();
  });

  test.each([
    "1",
  ])("deprecated for SVGO version '%s'", (svgoVersion) => {
    const config = {
      svgoVersion: {
        value: svgoVersion as SupportedSvgoVersions,
      },
    };

    deprecationWarnings({ config, core });
    expect(core.warning).toHaveBeenCalledWith(
      "This SVGO version is no longer supported. Upgrade to v2.x.x or higher",
    );
  });
});
