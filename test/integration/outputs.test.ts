import out from "../__common__/outputter.mock";

import outputs from "../../src/outputs";

describe("package outputs", () => {
  const EVENT_PULL_REQUEST = "pull_request";
  const EVENT_PUSH = "push";
  const EVENT_REPOSITORY_DISPATCH = "repository_dispatch";
  const EVENT_SCHEDULE = "schedule";
  const EVENT_WORKFLOW_DISPATCH = "workflow_dispatch";

  const data = {
    optimizedCount: 3,
    svgCount: 14,
  };

  test.each([
    EVENT_PULL_REQUEST,
    EVENT_PUSH,
    EVENT_REPOSITORY_DISPATCH,
    EVENT_SCHEDULE,
    EVENT_WORKFLOW_DISPATCH,
  ])("known event ('%s')", (eventName) => {
    const env = { context: { eventName } };

    const err = outputs.Set({ env, data, out });
    expect(err).toBeNull();
    expect(out.setOutput).toHaveBeenCalled();
  });

  test("unknown event", () => {
    const env = { context: { eventName: "foobar" } };

    const err = outputs.Set({ env, data, out });
    expect(err).not.toBeNull();
  });
});
