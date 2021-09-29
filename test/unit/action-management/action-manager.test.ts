import { mocked } from "ts-jest/utils";

jest.mock("@actions/core");
jest.mock("../../../src/action-management/helpers");
jest.mock("../../../src/errors");

import * as _core from "@actions/core";

import * as _helpers from "../../../src/action-management/helpers";

const core = mocked(_core);
const helpers = mocked(_helpers);

import errors from "../../../src/errors";

import StandardActionManager from "../../../src/action-management/action-manager"; // eslint-disable-line max-len

describe("action-management/action-manager.ts", () => {
  const testConditions = [
    true,
    false,
    null,
    errors.New("foobar"),
  ];

  describe.each([true, false])("::failIf (strict=%s)", (strict) => {
    const msg = "Hello world!";

    let actionManager;

    beforeEach(() => {
      actionManager = new StandardActionManager(core, strict);
    });

    beforeEach(() => {
      helpers.runIf.mockClear();
      core.setFailed.mockClear();
    });

    test.each([
      ...testConditions,
    ])("fails conditionally (cond=`%s`)", (condition) => {
      actionManager.failIf(condition, msg);
      expect(helpers.runIf).toHaveBeenCalledTimes(1);
      expect(helpers.runIf).toHaveBeenCalledWith(condition, expect.anything());
    });

    test("calls the correct function", () => {
      helpers.runIf.mockImplementationOnce((_, fn) => fn());

      actionManager.failIf(false, msg);
      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(msg);
    });
  });

  describe.each([true, false])("::strictFailIf (strict=%s)", (strict) => {
    const msg = "Hello world!";

    let actionManager;

    beforeEach(() => {
      actionManager = new StandardActionManager(core, strict);
    });

    beforeEach(() => {
      helpers.runIf.mockClear();
      core.setFailed.mockClear();
    });

    test.each([
      ...testConditions,
    ])("fails/warns conditionally (cond=`%s`)", (condition) => {
      actionManager.strictFailIf(condition, msg);
      expect(helpers.runIf).toHaveBeenCalledTimes(1);
      expect(helpers.runIf).toHaveBeenCalledWith(condition, expect.anything());
    });

    test("calls the correct function", () => {
      const callbackFn = strict ? core.setFailed : core.warning; // eslint-disable-line jest/no-if

      helpers.runIf.mockImplementationOnce((_, fn) => fn());

      actionManager.strictFailIf(false, msg);
      expect(callbackFn).toHaveBeenCalledTimes(1);
      expect(callbackFn).toHaveBeenCalledWith(msg);
    });
  });
});
