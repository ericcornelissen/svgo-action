import {
  isEventSupported,
} from "../../../src/helpers/events";

describe("helpers/events.ts", () => {
  const EVENT_PULL_REQUEST = "pull_request";
  const EVENT_PUSH = "push";
  const EVENT_REPOSITORY_DISPATCH = "repository_dispatch";
  const EVENT_SCHEDULE = "schedule";
  const EVENT_WORKFLOW_DISPATCH = "workflow_dispatch";

  describe("::isEventSupported", () => {
    test.each([
      EVENT_PULL_REQUEST,
      EVENT_PUSH,
      EVENT_REPOSITORY_DISPATCH,
      EVENT_SCHEDULE,
      EVENT_WORKFLOW_DISPATCH,
    ])("supported event (%s)", (eventName) => {
      const context = { eventName };

      const [result, ok] = isEventSupported({ context });
      expect(ok).toBe(true);
      expect(result).toEqual(eventName);
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("unsupported event (%s)", (eventName) => {
      const context = { eventName };

      const [result, ok] = isEventSupported({ context });
      expect(ok).toBe(false);
      expect(result).toEqual(eventName);
    });
  });
});
