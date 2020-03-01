import * as core from "./mocks/@actions/core.mock";

jest.mock("@actions/core", () => core);

import {
  ActionConfig,
  ConfigObject,
  getConfigurationPath,
  getRepoToken,
} from "../src/inputs";


describe("::getConfigurationPath", () => {

  test("return what core returns", () => {
    const expected = core.getInput("configuration-path");
    const result = getConfigurationPath();
    expect(result).toEqual(expected);
  });

});

describe("::getRepoToken", () => {

  test("return what core returns", () => {
    const expected = core.getInput("repo-token");
    const result = getRepoToken();
    expect(result).toEqual(expected);
  });

});

describe("ActionConfig", () => {

  describe("constructor", () => {

    test("construct without a parameter", () => {
      expect(() => new ActionConfig()).not.toThrow();
    });

    test("construct without an empty object", () => {
      expect(() => new ActionConfig({ })).not.toThrow();
    });

    test("construct with object specifying dry-run", () => {
      const config: ConfigObject = { "dry-run": "true" };
      expect(() => new ActionConfig(config)).not.toThrow();
    });

  });

  describe(".isDryRun", () => {

    const testNonBoolean = test.each(["foobar", "treu", "fals"]);

    beforeEach(() => {
      core.info.mockClear();
    });

    test("dry-run is `false` in the workflow file", () => {
      const instance: ActionConfig = new ActionConfig();
      core.getInput.mockReturnValueOnce("false");

      const result = instance.isDryRun();
      expect(result).toBe(false);
    });

    test("dry-run is `true` in the workflow file", () => {
      const instance: ActionConfig = new ActionConfig();
      core.getInput.mockReturnValueOnce("true");

      const result = instance.isDryRun();
      expect(result).toBe(true);
    });

    testNonBoolean("dry run is `'%s'` in the workflow file", async (value) => {
      const instance: ActionConfig = new ActionConfig();
      core.getInput.mockReturnValueOnce(value);

      const result = instance.isDryRun();
      expect(result).toBe(true);
      expect(core.info).toHaveBeenCalledTimes(1);
    });

    test("dry-run is `false` in the config object", () => {
      const instance: ActionConfig = new ActionConfig({ "dry-run": "false" });
      core.getInput.mockReturnValueOnce("true");

      const result = instance.isDryRun();
      expect(result).toBe(false);
    });

    test("dry-run is `true` in the config object", () => {
      const instance: ActionConfig = new ActionConfig({ "dry-run": "true" });
      core.getInput.mockReturnValueOnce("false");

      const result = instance.isDryRun();
      expect(result).toBe(true);
    });

    testNonBoolean("dry run is `'%s'` in the config object", async (value) => {
      const instance: ActionConfig = new ActionConfig({ "dry-run": value });
      core.getInput.mockReturnValueOnce("false");

      const result = instance.isDryRun();
      expect(result).toBe(true);
      expect(core.info).toHaveBeenCalledTimes(1);
    });

  });

});
