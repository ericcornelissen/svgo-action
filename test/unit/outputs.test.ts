import type { OptimizeProjectData } from "../../src/types";

import out from "../__mocks__/outputter.mock";

import {
  setOutputValues,
} from "../../src/outputs";

const DID_OPTIMIZE = "DID_OPTIMIZE";
const IGNORED_COUNT = "IGNORED_COUNT";
const OPTIMIZED_COUNT = "OPTIMIZED_COUNT";
const SVG_COUNT = "SVG_COUNT";

const EVENT_PULL_REQUEST = "pull_request";
const EVENT_PUSH = "push";
const EVENT_SCHEDULE = "schedule";

describe.each([
  { ignoredCount: 3, optimizedCount: 1, svgCount: 4 },
  { ignoredCount: 2, optimizedCount: 7, svgCount: 18 },
  { ignoredCount: 1, optimizedCount: 0, svgCount: 3 },
])("Outputs (%o)", ({ ignoredCount, optimizedCount, svgCount }) => {
  const didOptimize = optimizedCount > 0;
  const data: OptimizeProjectData = {
    ignoredCount,
    optimizedCount,
    svgCount,
  };

  beforeEach(() => {
    out.setOutput.mockReset();
  });

  describe.each([
    EVENT_PULL_REQUEST,
    EVENT_PUSH,
    EVENT_SCHEDULE,
  ])("for known event '%s'", (eventName) => {
    const context = {
      eventName,
    };

    test("did optimize", () => {
      const err = setOutputValues({ context, data, out });

      expect(err).toBeNull();
      expect(out.setOutput).toHaveBeenCalledWith(
        DID_OPTIMIZE,
        `${didOptimize}`,
      );
    });

    test("ignored count", () => {
      const err = setOutputValues({ context, data, out });

      expect(err).toBeNull();
      expect(out.setOutput).toHaveBeenCalledWith(
        IGNORED_COUNT,
        `${ignoredCount}`,
      );
    });

    test("optimized count", () => {
      const err = setOutputValues({ context, data, out });

      expect(err).toBeNull();
      expect(out.setOutput).toHaveBeenCalledWith(
        OPTIMIZED_COUNT,
        `${optimizedCount}`,
      );
    });

    test("svg count", () => {
      const err = setOutputValues({ context, data, out });

      expect(err).toBeNull();
      expect(out.setOutput).toHaveBeenCalledWith(SVG_COUNT, `${svgCount}`);
    });
  });

  describe("for unknown event", () => {
    const context = {
      eventName: "uNkNoWn EvEnT",
    };

    test("did optimize", () => {
      const err = setOutputValues({ context, data, out });

      expect(err).not.toBeNull();
    });
  });
});
