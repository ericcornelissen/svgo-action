import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_REPOSITORY_DISPATCH,
  EVENT_SCHEDULE,
  EVENT_WORKFLOW_DISPATCH,
} from "../../../src/constants/events";

import {
  getOutputNamesFor,
  OutputName,
} from "../../../src/outputs/names";

describe("outputs/names.js", () => {
  test.each([
    EVENT_PULL_REQUEST,
    EVENT_PUSH,
    EVENT_REPOSITORY_DISPATCH,
    EVENT_SCHEDULE,
    EVENT_WORKFLOW_DISPATCH,
  ])("output names for '%s'", (event) => {
    const [result, err] = getOutputNamesFor(event);
    expect(err).toBeNull();
    expect(result).toContain(OutputName.DID_OPTIMIZE);
    expect(result).toContain(OutputName.OPTIMIZED_COUNT);
    expect(result).toContain(OutputName.SVG_COUNT);
  });
});
