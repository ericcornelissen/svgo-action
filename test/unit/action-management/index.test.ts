import { mocked } from "ts-jest/utils";

jest.mock("@actions/core");
jest.mock("../../../src/action-management/action-manager");

import * as _core from "@actions/core";

import _ActionManager from "../../../src/action-management/action-manager";
import actionManagement from "../../../src/action-management/index";

const ActionManager = mocked(_ActionManager);
const core = mocked(_core);

describe("action-management/index.ts", () => {
  describe("::New", () => {
    beforeEach(() => {
      ActionManager.mockClear();
    });

    test.each([true, false])("strict=%s", (strict) => {
      const config = {
        isStrictMode: {
          value: strict,
        },
      };

      actionManagement.New({ core, config });
      expect(ActionManager).toHaveBeenCalledTimes(1);
    });
  });
});
