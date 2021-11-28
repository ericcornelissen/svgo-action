import { mocked } from "ts-jest/utils";

jest.mock("@actions/core");

import * as _core from "@actions/core";

import actionManagement from "../../src/action-management";
import errors from "../../src/errors";

const core = mocked(_core);

describe("package action-management", () => {
  describe.each([
    true,
    false,
  ])("ActionManager", (strict) => {
    const config = { isStrictMode: { value: strict } };
    const err = errors.New("foobar");
    const msg = "Hello world!";

    let action;

    beforeEach(() => {
      action = actionManagement.New({ core, config });

      core.setFailed.mockClear();
    });

    describe("::failIf", () => {
      beforeEach(() => {
        core.setFailed.mockClear();
      });

      test("condition is `true`", async () => {
        action.failIf(true, msg);

        expect(core.setFailed).toHaveBeenCalledTimes(1);
        expect(core.setFailed).toHaveBeenCalledWith(msg);
      });

      test("condition is `false`", async () => {
        action.failIf(false, msg);

        expect(core.setFailed).not.toHaveBeenCalled();
      });

      test("condition is `null`", async () => {
        action.failIf(null, msg);

        expect(core.setFailed).not.toHaveBeenCalled();
      });

      test("condition is an error", async () => {
        action.failIf(err, msg);

        expect(core.setFailed).toHaveBeenCalledTimes(1);
        expect(core.setFailed).toHaveBeenCalledWith(msg);
      });
    });

    describe("::strictFailIf", () => {
      const callbackFn = strict ? core.setFailed : core.warning;

      beforeEach(() => {
        core.setFailed.mockClear();
        core.warning.mockClear();
      });

      test("condition is `true`", async () => {
        action.strictFailIf(true, msg);

        expect(callbackFn).toHaveBeenCalledTimes(1);
        expect(callbackFn).toHaveBeenCalledWith(msg);
      });

      test("condition is `false`", async () => {
        action.strictFailIf(false, msg);

        expect(core.setFailed).not.toHaveBeenCalled();
        expect(core.warning).not.toHaveBeenCalled();
      });

      test("condition is `null`", async () => {
        action.strictFailIf(null, msg);

        expect(core.setFailed).not.toHaveBeenCalled();
        expect(core.warning).not.toHaveBeenCalled();
      });

      test("condition is an error", async () => {
        action.strictFailIf(err, msg);

        expect(callbackFn).toHaveBeenCalledTimes(1);
        expect(callbackFn).toHaveBeenCalledWith(msg);
      });
    });
  });
});
