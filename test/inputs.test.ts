import * as yaml from "js-yaml";

import * as core from "./mocks/@actions/core.mock";

jest.mock("@actions/core", () => core);

import {
  // Types
  RawActionConfig,

  // Functionality
  ActionConfig,
  getConfigFilePath,
  getRepoToken,
} from "../src/inputs";


describe("::getConfigFilePath", () => {

  test("return what core returns", () => {
    const expected = core.getInput("configuration-path");
    const result = getConfigFilePath();
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

  describe("::constructor", () => {

    test("construct without a parameter", () => {
      expect(() => new ActionConfig()).not.toThrow();
    });

    test("construct without an empty object", () => {
      expect(() => new ActionConfig({ })).not.toThrow();
    });

    test("construct with an object specifying dry-run", () => {
      const config: RawActionConfig = { "dry-run": true };
      expect(() => new ActionConfig(config)).not.toThrow();
    });

  });

  describe(".isDryRun", () => {

    const testNonBoolean = test.each(["foobar", "treu", "fals"]);

    beforeEach(() => {
      core.info.mockClear();
    });

    test("dry-run is `false` in the workflow file", () => {
      core.getInput.mockReturnValueOnce("false");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `true` in the workflow file", () => {
      core.getInput.mockReturnValueOnce("true");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(true);
    });

    testNonBoolean("dry run is `'%s'` in the workflow file", async (value) => {
      core.getInput.mockReturnValueOnce(value);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(true);
      expect(core.info).toHaveBeenCalledTimes(1);
    });

    test("dry-run is `false` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: false");
      core.getInput.mockReturnValueOnce("true");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `true` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: true");
      core.getInput.mockReturnValueOnce("false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

    test("dry-run is `'false'` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: 'false'");
      core.getInput.mockReturnValueOnce("true");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'true'` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: 'true'");
      core.getInput.mockReturnValueOnce("false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

    testNonBoolean("dry run is `'%s'` in the config object", async (value) => {
      const rawConfig: RawActionConfig = yaml.safeLoad(`dry-run: '${value}'`);
      core.getInput.mockReturnValueOnce("false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
      expect(core.info).toHaveBeenCalledTimes(1);
    });

  });

  describe(".svgoOptionsPath", () => {

    const testPaths = test.each([".svgo.yml", "foo.yml", "in/folder/config.yml"]);

    testPaths("svgo-options is set (to '%s') in the workflow file", (path) => {
      core.getInput.mockReturnValue(path);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.svgoOptionsPath).toBe(path);
    });

    testPaths("svgo-options is set (to '%s') in the config object", (path) => {
      core.getInput.mockReturnValue(path);

      const instance: ActionConfig = new ActionConfig({ "svgo-options": path });
      expect(instance.svgoOptionsPath).toBe(path);
    });

  });

});
