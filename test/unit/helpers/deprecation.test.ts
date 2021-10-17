import type { SupportedSvgoVersions } from "../../../src/svgo";

import { mocked } from "ts-jest/utils";

jest.mock("@actions/core");

import * as _core from "@actions/core";

const core = mocked(_core);

import {
  deprecationWarnings,
} from "../../../src/helpers/deprecation";

describe("helpers/deprecation.ts", () => {
  beforeEach(() => {
    core.warning.mockClear();
  });

  test.each([
    2,
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
    1,
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
