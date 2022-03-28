jest.mock("@actions/core");
jest.mock("../../../src/action-management/helpers");
jest.mock("../../../src/errors");

import * as core from "@actions/core";

import StandardActionManager from "../../../src/action-management/action-manager"; // eslint-disable-line max-len
import * as helpers from "../../../src/action-management/helpers";
import errors from "../../../src/errors";

const coreSetFailed = core.setFailed as jest.MockedFunction<typeof core.setFailed>; // eslint-disable-line max-len
const helpersRunIf = helpers.runIf as jest.MockedFunction<typeof helpers.runIf>;

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
      coreSetFailed.mockClear();
      helpersRunIf.mockClear();
    });

    test.each([
      ...testConditions,
    ])("fails conditionally (condition=`%s`)", (condition) => {
      actionManager.failIf(condition, msg);
      expect(helpers.runIf).toHaveBeenCalledTimes(1);
      expect(helpers.runIf).toHaveBeenCalledWith(condition, expect.anything());
    });

    test("calls the correct function", () => {
      helpersRunIf.mockImplementationOnce((_, fn) => fn());

      actionManager.failIf(false, msg);
      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(msg);
    });
  });

  describe.each([
    [true, core.setFailed],
    [false, core.warning],
  ])("::strictFailIf (strict=%s)", (strict, callbackFn) => {
    const msg = "Hello world!";

    let actionManager;

    beforeEach(() => {
      actionManager = new StandardActionManager(core, strict);
    });

    beforeEach(() => {
      coreSetFailed.mockClear();
      helpersRunIf.mockClear();
    });

    test.each([
      ...testConditions,
    ])("fails/warns conditionally (condition=`%s`)", (condition) => {
      actionManager.strictFailIf(condition, msg);
      expect(helpers.runIf).toHaveBeenCalledTimes(1);
      expect(helpers.runIf).toHaveBeenCalledWith(condition, expect.anything());
    });

    test("calls the correct function", () => {
      helpersRunIf.mockImplementationOnce((_, fn) => fn());

      actionManager.strictFailIf(false, msg);
      expect(callbackFn).toHaveBeenCalledTimes(1);
      expect(callbackFn).toHaveBeenCalledWith(msg);
    });
  });
});
