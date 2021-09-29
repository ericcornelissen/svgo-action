import out from "../../__common__/outputter.mock";

import outputs from "../../../src/outputs";

describe.each([
  { optimizedCount: 1, svgCount: 4 },
  { optimizedCount: 7, svgCount: 18 },
  { optimizedCount: 0, svgCount: 3 },
])("Outputs", ({ optimizedCount, svgCount }) => {
  const didOptimize = optimizedCount > 0;
  const data = {
    optimizedCount,
    svgCount,
  };

  const DID_OPTIMIZE = "DID_OPTIMIZE";
  const OPTIMIZED_COUNT = "OPTIMIZED_COUNT";
  const SVG_COUNT = "SVG_COUNT";

  const EVENT_PULL_REQUEST = "pull_request";
  const EVENT_PUSH = "push";
  const EVENT_REPOSITORY_DISPATCH = "repository_dispatch";
  const EVENT_SCHEDULE = "schedule";
  const EVENT_WORKFLOW_DISPATCH = "workflow_dispatch";

  beforeEach(() => {
    out.setOutput.mockReset();
  });

  describe.each([
    EVENT_PULL_REQUEST,
    EVENT_PUSH,
    EVENT_REPOSITORY_DISPATCH,
    EVENT_SCHEDULE,
    EVENT_WORKFLOW_DISPATCH,
  ])("known event ('%s')", (eventName) => {
    const env = {
      context: {
        eventName,
      },
    };

    test("did optimize", () => {
      const err = outputs.Set({ env, data, out });

      expect(err).toBeNull();
      expect(out.setOutput).toHaveBeenCalledWith(
        DID_OPTIMIZE,
        `${didOptimize}`,
      );
    });

    test("optimized count", () => {
      const err = outputs.Set({ env, data, out });

      expect(err).toBeNull();
      expect(out.setOutput).toHaveBeenCalledWith(
        OPTIMIZED_COUNT,
        `${optimizedCount}`,
      );
    });

    test("svg count", () => {
      const err = outputs.Set({ env, data, out });

      expect(err).toBeNull();
      expect(out.setOutput).toHaveBeenCalledWith(SVG_COUNT, `${svgCount}`);
    });
  });

  describe("unknown event", () => {
    const env = {
      context: {
        eventName: "uNkNoWn EvEnT",
      },
    };

    test("did optimize", () => {
      const err = outputs.Set({ env, data, out });

      expect(err).not.toBeNull();
      expect(err).toContain("unknown event");
    });
  });
});
