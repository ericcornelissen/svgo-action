import type { SupportedSvgoVersions } from "../../../src/svgo";

import { mocked } from "ts-jest/utils";

import inp from "../../__common__/inputter.mock";

jest.mock("../../../src/errors");
jest.mock("../../../src/inputs/getters");
jest.mock("../../../src/inputs/helpers");

import * as _getters from "../../../src/inputs/getters";
import * as _helpers from "../../../src/inputs/helpers";
import inputs from "../../../src/inputs/index";
import errors from "../../../src/errors";

const getters = mocked(_getters);
const helpers = mocked(_helpers);

describe("inputs/index.ts", () => {
  describe("::New", () => {
    const provided = true;

    test("create config", () => {
      const [result, err] = inputs.New({ inp });

      expect(err).toBeNull();
      expect(result).toBeDefined();

      expect(getters.getIgnoreGlobs).toHaveBeenCalledTimes(1);
      expect(getters.getIsDryRun).toHaveBeenCalledTimes(1);
      expect(getters.getSvgoConfigPath).toHaveBeenCalledTimes(1);
      expect(getters.getSvgoVersion).toHaveBeenCalledTimes(1);

      expect(helpers.getDefaultSvgoConfigPath).toHaveBeenCalledTimes(1);
    });

    describe("ignoreGlob", () => {
      test("can get value", () => {
        const configuredValues = ["foobar"];

        getters.getIgnoreGlobs.mockReturnValueOnce([
          { provided, value: configuredValues },
          null,
        ]);

        const [result, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(result.ignoreGlobs.value).toEqual(configuredValues);
      });

      test("can't get value", () => {
        const errorMsg = "couldn't get ignoreGlob";

        getters.getIgnoreGlobs.mockReturnValueOnce([
          { provided, value: [] },
          errors.New(errorMsg),
        ]);

        const [result, err] = inputs.New({ inp });

        expect(result).toBeDefined();

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });

      test("default value", () => {
        const [result, err] = inputs.New({ inp });

        expect(result).toBeDefined();

        expect(err).toBeNull();
        expect(getters.getIgnoreGlobs).toHaveBeenCalledWith(inp, []);
      });
    });

    describe("isDryRun", () => {
      test("can get value", () => {
        const configuredValue = false;

        getters.getIsDryRun.mockReturnValueOnce([
          { provided, value: configuredValue },
          null,
        ]);

        const [result, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(result.isDryRun.value).toEqual(configuredValue);
      });

      test("can't get value", () => {
        const errorMsg = "couldn't get dry-run";

        getters.getIsDryRun.mockReturnValueOnce([
          { provided, value: true },
          errors.New(errorMsg),
        ]);

        const [result, err] = inputs.New({ inp });

        expect(result).toBeDefined();

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });

      test("default value", () => {
        const [result, err] = inputs.New({ inp });

        expect(result).toBeDefined();

        expect(err).toBeNull();
        expect(getters.getIsDryRun).toHaveBeenCalledWith(inp, false);
      });
    });

    describe("isStrictMode", () => {
      test("can get value", () => {
        const configuredValue = false;

        getters.getIsStrictMode.mockReturnValueOnce([
          { provided, value: configuredValue },
          null,
        ]);

        const [result, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(result.isStrictMode.value).toEqual(configuredValue);
      });

      test("can't get value", () => {
        const errorMsg = "couldn't get strict";

        getters.getIsStrictMode.mockReturnValueOnce([
          { provided, value: true },
          errors.New(errorMsg),
        ]);

        const [result, err] = inputs.New({ inp });

        expect(result).toBeDefined();

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });

      test("default value", () => {
        const [result, err] = inputs.New({ inp });

        expect(result).toBeDefined();

        expect(err).toBeNull();
        expect(getters.getIsStrictMode).toHaveBeenCalledWith(inp, false);
      });
    });

    describe("svgoConfigPath", () => {
      beforeEach(() => {
        getters.getSvgoConfigPath.mockClear();
      });

      test("can get value", () => {
        const configuredValue = "foobar";

        getters.getSvgoConfigPath.mockReturnValueOnce([
          { provided, value: configuredValue },
          null,
        ]);

        const [result, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(result.svgoConfigPath.value).toEqual(configuredValue);
      });

      test("can't get value", () => {
        const errorMsg = "couldn't get svgo-config";

        getters.getSvgoConfigPath.mockReturnValueOnce([
          { provided, value: "" },
          errors.New(errorMsg),
        ]);

        const [result, err] = inputs.New({ inp });

        expect(result).toBeDefined();

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });

      test.each([
        ["1", ".svgo.yml"],
        ["2", "svgo.config.js"],
      ])("default value", (svgoVersion, svgoConfigPath) => {
        getters.getSvgoVersion.mockReturnValueOnce([
          { provided, value: svgoVersion as SupportedSvgoVersions },
          null,
        ]);
        helpers.getDefaultSvgoConfigPath.mockReturnValueOnce(svgoConfigPath);

        const [, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(helpers.getDefaultSvgoConfigPath).toHaveBeenCalledWith(
          svgoVersion,
        );
        expect(getters.getSvgoConfigPath).toHaveBeenCalledWith(
          inp,
          svgoConfigPath,
        );
      });
    });

    describe("svgoVersion", () => {
      test("can get value", () => {
        const configuredValue =  "2";

        getters.getSvgoVersion.mockReturnValueOnce([
          { provided, value: configuredValue },
          null,
        ]);

        const [result, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(result.svgoVersion.value).toEqual(configuredValue);
      });

      test("can't get value", () => {
        const errorMsg = "couldn't get svgo-version";

        getters.getSvgoVersion.mockReturnValueOnce([
          { provided, value: "2" },
          errors.New(errorMsg),
        ]);

        const [result, err] = inputs.New({ inp });

        expect(result).toBeDefined();

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });

      test("default value", () => {
        const [, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(getters.getSvgoVersion).toHaveBeenCalledWith(inp, "2");
      });
    });
  });
});
