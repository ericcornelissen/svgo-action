import type { SupportedSvgoVersions } from "../../../src/svgo";

jest.mock("../../../src/errors");
jest.mock("../../../src/inputs/getters");
jest.mock("../../../src/inputs/helpers");

import errors from "../../../src/errors";
import * as getters from "../../../src/inputs/getters";
import * as helpers from "../../../src/inputs/helpers";
import inputs from "../../../src/inputs/index";
import inp from "../../__common__/inputter.mock";

const gettersGetIgnoreGlobs = getters.getIgnoreGlobs as jest.MockedFunction<typeof getters.getIgnoreGlobs>; // eslint-disable-line max-len
const gettersGetIsDryRun = getters.getIsDryRun as jest.MockedFunction<typeof getters.getIsDryRun>; // eslint-disable-line max-len
const gettersGetIsStrictMode = getters.getIsStrictMode as jest.MockedFunction<typeof getters.getIsStrictMode>; // eslint-disable-line max-len
const gettersGetSvgoConfigPath = getters.getSvgoConfigPath as jest.MockedFunction<typeof getters.getSvgoConfigPath>; // eslint-disable-line max-len
const gettersGetSvgoVersion = getters.getSvgoVersion as jest.MockedFunction<typeof getters.getSvgoVersion>; // eslint-disable-line max-len
const helpersGetDefaultSvgoConfigPath = helpers.getDefaultSvgoConfigPath as jest.MockedFunction<typeof helpers.getDefaultSvgoConfigPath>; // eslint-disable-line max-len

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

        gettersGetIgnoreGlobs.mockReturnValueOnce([
          { provided, value: configuredValues },
          null,
        ]);

        const [result, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(result.ignoreGlobs.value).toEqual(configuredValues);
      });

      test("can't get value", () => {
        const errorMsg = "couldn't get ignoreGlob";

        gettersGetIgnoreGlobs.mockReturnValueOnce([
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

        gettersGetIsDryRun.mockReturnValueOnce([
          { provided, value: configuredValue },
          null,
        ]);

        const [result, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(result.isDryRun.value).toBe(configuredValue);
      });

      test("can't get value", () => {
        const errorMsg = "couldn't get dry-run";

        gettersGetIsDryRun.mockReturnValueOnce([
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

        gettersGetIsStrictMode.mockReturnValueOnce([
          { provided, value: configuredValue },
          null,
        ]);

        const [result, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(result.isStrictMode.value).toBe(configuredValue);
      });

      test("can't get value", () => {
        const errorMsg = "couldn't get strict";

        gettersGetIsStrictMode.mockReturnValueOnce([
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
        gettersGetSvgoConfigPath.mockClear();
      });

      test("can get value", () => {
        const configuredValue = "foobar";

        gettersGetSvgoConfigPath.mockReturnValueOnce([
          { provided, value: configuredValue },
          null,
        ]);

        const [result, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(result.svgoConfigPath.value).toBe(configuredValue);
      });

      test("can't get value", () => {
        const errorMsg = "couldn't get svgo-config";

        gettersGetSvgoConfigPath.mockReturnValueOnce([
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
        gettersGetSvgoVersion.mockReturnValueOnce([
          { provided, value: svgoVersion as SupportedSvgoVersions },
          null,
        ]);
        helpersGetDefaultSvgoConfigPath.mockReturnValueOnce(svgoConfigPath);

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

        gettersGetSvgoVersion.mockReturnValueOnce([
          { provided, value: configuredValue },
          null,
        ]);

        const [result, err] = inputs.New({ inp });

        expect(err).toBeNull();
        expect(result.svgoVersion.value).toBe(configuredValue);
      });

      test("can't get value", () => {
        const errorMsg = "couldn't get svgo-version";

        gettersGetSvgoVersion.mockReturnValueOnce([
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
        expect(getters.getSvgoVersion).toHaveBeenCalledWith(inp, "3");
      });
    });
  });
});
