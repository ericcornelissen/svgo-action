import { mocked } from "ts-jest/utils";

import inp from "../../__common__/inputter.mock";

jest.mock("../../../src/errors");
jest.mock("../../../src/inputs/getters");

import * as _getters from "../../../src/inputs/getters";
import configs from "../../../src/inputs/index";
import errors from "../../../src/errors";

const getters = mocked(_getters);

describe("inputs/index.ts", () => {
  describe("::New", () => {
    test("create config", () => {
      const [result, err] = configs.New({ inp });

      expect(err).toBeNull();
      expect(result).toBeDefined();

      expect(getters.getIgnoreGlob).toHaveBeenCalledTimes(1);
      expect(getters.getIsDryRun).toHaveBeenCalledTimes(1);
      expect(getters.getSvgoConfigPath).toHaveBeenCalledTimes(1);
      expect(getters.getSvgoVersion).toHaveBeenCalledTimes(1);
    });

    describe("::ignoreGlob", () => {
      test("can get value", function () {
        const configuredValue = "foobar";

        getters.getIgnoreGlob.mockReturnValueOnce([configuredValue, null]);

        const [result, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(result.ignoreGlob).toEqual(configuredValue);
      });

      test("can't get value", function () {
        const errorMsg = "couldn't get ignoreGlob";

        getters.getIgnoreGlob.mockReturnValueOnce([
          "",
          errors.New(errorMsg),
        ]);

        const [, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });

      test("default value", function () {
        const [, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(getters.getIgnoreGlob).toHaveBeenCalledWith(inp, "");
      });
    });

    describe("::isDryRun", () => {
      test("can get value", function () {
        const configuredValue = false;

        getters.getIsDryRun.mockReturnValueOnce([configuredValue, null]);

        const [result, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(result.isDryRun).toEqual(configuredValue);
      });

      test("can't get value", function () {
        const errorMsg = "couldn't get dry-run";

        getters.getIsDryRun.mockReturnValueOnce([
          true,
          errors.New(errorMsg),
        ]);

        const [, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });

      test("default value", function () {
        const [, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(getters.getIsDryRun).toHaveBeenCalledWith(inp, false);
      });
    });

    describe("::svgoConfigPath", () => {
      beforeEach(() => {
        getters.getSvgoConfigPath.mockClear();
      });

      test("can get value", function () {
        const configuredValue = "foobar";

        getters.getSvgoConfigPath.mockReturnValueOnce([
          configuredValue,
          null,
        ]);

        const [result, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(result.svgoConfigPath).toEqual(configuredValue);
      });

      test("can't get value", function () {
        const errorMsg = "couldn't get svgo-config";

        getters.getSvgoConfigPath.mockReturnValueOnce([
          "",
          errors.New(errorMsg),
        ]);

        const [, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });

      test("default value for svgo-version 1", function () {
        getters.getSvgoVersion.mockReturnValueOnce([1, null]);

        const [, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(getters.getSvgoConfigPath).toHaveBeenCalledWith(
          inp,
          ".svgo.yml",
        );
      });

      test("default value for svgo-version 2", function () {
        getters.getSvgoVersion.mockReturnValueOnce([2, null]);

        const [, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(getters.getSvgoConfigPath).toHaveBeenCalledWith(
          inp,
          "svgo.config.js",
        );
      });
    });

    describe("::svgoVersion", () => {
      test("can get value", function () {
        const configuredValue =  2;

        getters.getSvgoVersion.mockReturnValueOnce([
          configuredValue,
          null,
        ]);

        const [result, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(result.svgoVersion).toEqual(configuredValue);
      });

      test("can't get value", function () {
        const errorMsg = "couldn't get svgo-version";

        getters.getSvgoVersion.mockReturnValueOnce([
          2,
          errors.New(errorMsg),
        ]);

        const [, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });

      test("default value", function () {
        const [, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(getters.getSvgoVersion).toHaveBeenCalledWith(inp, 2);
      });
    });
  });
});
