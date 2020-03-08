import { when } from "jest-when";
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


function mockCoreGetInput(key: string, value: string): void {
  when(core.getInput)
    .calledWith(key, expect.any(Object))
    .mockReturnValueOnce(value);
}

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

  describe(".commitDescription", () => {

    test.todo("commit is defined in the config object, but the description isn't");

    test.todo("commit description is defined in the config object");

    test.todo("commit description is an empty string in the config object");

  });

  describe(".commitTitle", () => {

    test.todo("commit is defined in the config object, but the title isn't");

    test.todo("commit title is defined in the config object");

    test.todo("commit title is an empty string in the config object");

  });

  describe(".isDryRun", () => {

    const inputName = "dry-run";
    const testNonBoolean = test.each(["foobar", "treu", "fals"]);

    beforeEach(() => {
      core.info.mockClear();
    });

    test("dry-run is not set at all", () => {
      const defaultValue = "false";
      mockCoreGetInput(inputName, defaultValue);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'false'` in the workflow file", () => {
      mockCoreGetInput(inputName, "false");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'true'` in the workflow file", () => {
      mockCoreGetInput(inputName, "true");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(true);
    });

    testNonBoolean("dry run is `'%s'` in the workflow file", async (value) => {
      mockCoreGetInput(inputName, value);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(true);
      expect(core.info).toHaveBeenCalledTimes(1);
    });

    test("dry-run is `false` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: false");
      mockCoreGetInput(inputName, "true");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `true` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: true");
      mockCoreGetInput(inputName, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

    test("dry-run is `'false'` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: 'false'");
      mockCoreGetInput(inputName, "true");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'true'` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: 'true'");
      mockCoreGetInput(inputName, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

    testNonBoolean("dry run is `'%s'` in the config object", async (value) => {
      const rawConfig: RawActionConfig = yaml.safeLoad(`dry-run: '${value}'`);
      mockCoreGetInput(inputName, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
      expect(core.info).toHaveBeenCalledTimes(1);
    });

  });

  describe(".svgoOptionsPath", () => {

    const inputName = "svgo-options";
    const testPaths = test.each([".svgo.yml", "foo.yml", "in/folder/config.yml"]);

    test("svgo-options is not set at all", () => {
      const defaultValue = ".svgo.yml";
      mockCoreGetInput(inputName, defaultValue);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.svgoOptionsPath).toBe(defaultValue);
    });

    testPaths("svgo-options is set (to '%s') in the workflow file", (path) => {
      mockCoreGetInput(inputName, path);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.svgoOptionsPath).toBe(path);
    });

    testPaths("svgo-options is set (to '%s') in the config object", (path) => {
      mockCoreGetInput(inputName, `dir/${path}`);

      const instance: ActionConfig = new ActionConfig({ "svgo-options": path });
      expect(instance.svgoOptionsPath).toBe(path);
    });

  });

});
