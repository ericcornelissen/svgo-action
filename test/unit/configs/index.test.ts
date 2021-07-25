import inp from "../../__mocks__/inputter.mock";

const gettersMock = {
  getIgnoreGlob: jest.fn()
    .mockReturnValue(["", null])
    .mockName("getters.getIgnoreGlob"),
  getIsDryRun: jest.fn()
    .mockReturnValue([false, null])
    .mockName("getters.getIsDryRun"),
  getSvgoConfigPath: jest.fn()
    .mockReturnValue(["", null])
    .mockName("getters.getSvgoConfigPath"),
  getSvgoVersion: jest.fn()
    .mockReturnValue([2, null])
    .mockName("getters.getSvgoVersion"),
};

jest.mock("../../../src/configs/getters", () => gettersMock);

import configs from "../../../src/configs/index";
import errors from "../../../src/errors";

describe("configs/index.ts", () => {
  describe("::New", () => {
    test("create config", () => {
      const [result, err] = configs.New({ inp });

      expect(err).toBeNull();
      expect(result).toBeDefined();

      expect(gettersMock.getIgnoreGlob).toHaveBeenCalledTimes(1);
      expect(gettersMock.getIsDryRun).toHaveBeenCalledTimes(1);
      expect(gettersMock.getSvgoConfigPath).toHaveBeenCalledTimes(1);
      expect(gettersMock.getSvgoVersion).toHaveBeenCalledTimes(1);
    });

    describe("::ignoreGlob", () => {
      test("can get value", function () {
        const configuredValue = "foobar";

        gettersMock.getIgnoreGlob.mockReturnValueOnce([configuredValue, null]);

        const [result, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(result.ignoreGlob).toEqual(configuredValue);
      });

      test("can't get value", function () {
        const errorMsg = "couldn't get ignoreGlob";

        gettersMock.getIgnoreGlob.mockReturnValueOnce([
          "",
          errors.New(errorMsg),
        ]);

        const [, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });
    });

    describe("::isDryRun", () => {
      test("can get value", function () {
        const configuredValue = false;

        gettersMock.getIsDryRun.mockReturnValueOnce([configuredValue, null]);

        const [result, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(result.isDryRun).toEqual(configuredValue);
      });

      test("can't get value", function () {
        const errorMsg = "couldn't get dry-run";

        gettersMock.getIsDryRun.mockReturnValueOnce([
          true,
          errors.New(errorMsg),
        ]);

        const [, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });
    });

    describe("::svgoConfigPath", () => {
      test("can get value", function () {
        const configuredValue = "foobar";

        gettersMock.getSvgoConfigPath.mockReturnValueOnce([
          configuredValue,
          null,
        ]);

        const [result, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(result.svgoConfigPath).toEqual(configuredValue);
      });

      test("can't get value", function () {
        const errorMsg = "couldn't get svgo-config";

        gettersMock.getSvgoConfigPath.mockReturnValueOnce([
          "",
          errors.New(errorMsg),
        ]);

        const [, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });
    });

    describe("::svgoVersion", () => {
      test("can get value", function () {
        const configuredValue =  2;

        gettersMock.getSvgoVersion.mockReturnValueOnce([
          configuredValue,
          null,
        ]);

        const [result, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(result.svgoVersion).toEqual(configuredValue);
      });

      test("can't get value", function () {
        const errorMsg = "couldn't get svgo-version";

        gettersMock.getSvgoVersion.mockReturnValueOnce([
          "",
          errors.New(errorMsg),
        ]);

        const [, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });
    });
  });
});
