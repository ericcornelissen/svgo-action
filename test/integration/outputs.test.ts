import { mocked } from "ts-jest/utils";

jest.mock("@actions/core");

import * as _core from "@actions/core";

const core = mocked(_core);

import {
  setOutputValues,
} from "../../src/outputs";

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
    const context = { eventName };

    const err = setOutputValues({ context, data, out: core });
    expect(err).toBeNull();
    expect(core.setOutput).toHaveBeenCalled();
  });

  test("unknown event", () => {
    const context = { eventName: "foobar" };

    const err = setOutputValues({ context, data, out: core });
    expect(err).not.toBeNull();
  });
});
