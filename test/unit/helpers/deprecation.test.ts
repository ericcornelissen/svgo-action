import type { SupportedSvgoVersions } from "../../../src/svgo";

jest.mock("@actions/core");

import * as core from "@actions/core";

import {
  deprecationWarnings,
} from "../../../src/helpers/deprecation";

describe("helpers/deprecation.ts", () => {
  beforeEach(() => {
    const coreWarning = core.warning as jest.MockedFunction<typeof core.warning>; // eslint-disable-line max-len

    coreWarning.mockClear();
  });

  test.each([
    "2",
    "project",
  ])("not deprecated version (%s)", (svgoVersion) => {
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
  ])("deprecated version (%s)", (svgoVersion) => {
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
