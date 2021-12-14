jest.mock("@actions/core");
jest.mock("../../../src/action-management/action-manager");

import * as core from "@actions/core";

import ActionManager from "../../../src/action-management/action-manager";
import actionManagement from "../../../src/action-management/index";

const ActionManagerMock = ActionManager as jest.MockedClass<typeof ActionManager>; // eslint-disable-line max-len

describe("action-management/index.ts", () => {
  describe("::New", () => {
    beforeEach(() => {
      ActionManagerMock.mockClear();
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
