jest.mock("../../../src/errors");

import errors from "../../../src/errors";

import {
  runIf,
} from "../../../src/action-management/helpers";

describe("action-management/helpers.ts", () => {
  describe("::runIf", () => {
    const spy = jest.fn();

    beforeEach(() => {
      spy.mockClear();
    });

    test("boolean, true", () => {
      runIf(true, spy);
      expect(spy).toHaveBeenCalledTimes(1);
    });

    test("boolean, false", () => {
      runIf(false, spy);
      expect(spy).not.toHaveBeenCalled();
    });

    test("error, null", () => {
      runIf(null, spy);
      expect(spy).not.toHaveBeenCalled();
    });

    test("error, an error", () => {
      const err = errors.New("foobar");
      runIf(err, spy);
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});
