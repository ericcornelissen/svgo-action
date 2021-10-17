import {
  isClientRequired,
  isEventSupported,
} from "../../../src/helpers/events";

describe("helpers/events.ts", () => {
  const EVENT_PULL_REQUEST = "pull_request";
  const EVENT_PUSH = "push";
  const EVENT_REPOSITORY_DISPATCH = "repository_dispatch";
  const EVENT_SCHEDULE = "schedule";
  const EVENT_WORKFLOW_DISPATCH = "workflow_dispatch";

  describe("::isClientRequired", () => {
    test.each([
      EVENT_PULL_REQUEST,
      EVENT_PUSH,
    ])("events where client is required (%s)", (eventName) => {
      const result = isClientRequired(eventName);
      expect(result).toBe(true);
    });

    test.each([
      EVENT_REPOSITORY_DISPATCH,
      EVENT_SCHEDULE,
      EVENT_WORKFLOW_DISPATCH,
    ])("known events where client is not required (%s)", (eventName) => {
      const result = isClientRequired(eventName);
      expect(result).toBe(false);
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("unknown events where client is not required (%s)", (eventName) => {
      const result = isClientRequired(eventName);
      expect(result).toBe(false);
    });
  });

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
      expect(result).toBe(eventName);
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("unsupported event (%s)", (eventName) => {
      const context = { eventName };

      const [result, ok] = isEventSupported({ context });
      expect(ok).toBe(false);
      expect(result).toBe(eventName);
    });
  });
});
