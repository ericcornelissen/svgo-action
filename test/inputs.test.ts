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


const INPUT_NAME_CONFIG_PATH = "configuration-path";
const INPUT_NAME_CONVENTIONAL_COMMITS = "conventional-commits";
const INPUT_NAME_DRY_RUN = "dry-run";
const INPUT_NAME_REPO_TOKEN = "repo-token";
const INPUT_NAME_SVGO_OPTIONS = "svgo-options";

function mockCoreGetInput(key: string, value: string): void {
  when(core.getInput)
    .calledWith(key, expect.any(Object))
    .mockReturnValueOnce(value);
}


describe("::getConfigFilePath", () => {

  test("return what core returns", () => {
    const expected = core.getInput(INPUT_NAME_CONFIG_PATH);
    const result = getConfigFilePath();
    expect(result).toEqual(expected);
  });

});

describe("::getRepoToken", () => {

  test("return what core returns", () => {
    const expected = core.getInput(INPUT_NAME_REPO_TOKEN);
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

    test("commit is not defined in the config object", () => {
      const instance: ActionConfig = new ActionConfig({ });
      expect(instance.commitDescription).toBeDefined();
    });

    test("commit is defined in the config object, but the description isn't", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { } });
      expect(instance.commitDescription).toBeDefined();
    });

    test.each([
      "This is a commit description",
      "This is templated commit description {{optimizedCount}}",
      "These are not the droids you're looking for",
    ])("commit description is defined in the config object", (description) => {
      const instance: ActionConfig = new ActionConfig({ commit: { description } });
      expect(instance.commitDescription).toEqual(description);
    });

    test("commit description is an empty string in the config object", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { description: "" } });
      expect(instance.commitDescription).toBeDefined();
      expect(instance.commitDescription).not.toEqual("");
    });

  });

  describe(".commitTitle", () => {

    const CONVENTIONAL_COMMIT_EXP = /.+:\s.+/;

    const testNonBoolean = test.each(["foobar", "treu", "fals"]);

    test("commit is not defined in the config object", () => {
      const instance: ActionConfig = new ActionConfig({ });
      expect(instance.commitTitle).toBeDefined();
    });

    test("commit is defined in the config object, but the title isn't", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { } });
      expect(instance.commitTitle).toBeDefined();
    });

    test.each([
      "This is a commit title",
      "This is templated commit title {{optimizedCount}}",
      "If you see a rat the size of a car, you're playing the wrong game",
    ])("commit title is defined in the config object", (title) => {
      const instance: ActionConfig = new ActionConfig({ commit: { title } });
      expect(instance.commitTitle).toEqual(title);
    });

    test("commit title is an empty string in the config object", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { title: "" } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
    });

    test("conventional-commits is enabled and no commit title is specified", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "true");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("conventional-commits is enabled and a commit title is specified", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "true");

      const instance: ActionConfig = new ActionConfig({ commit: { title: "deadbeef" } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("conventional-commits is disabled and no commit title is specified", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "false");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).not.toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("conventional-commits is disabled and a commit title is specified", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "false");

      const instance: ActionConfig = new ActionConfig({ commit: { title: "Do the thing" } });
      expect(instance.commitTitle).toEqual("Do the thing");
    });

    testNonBoolean("conventional-commits is '%s'", (value) => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, value);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`Unknown conventional-commits value '${value}'`),
      );
    });

    test("commit.conventional is enabled and no commit title is specified", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { conventional: true } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("commit.conventional is enabled and a commit title is specified", () => {
      const instance: ActionConfig = new ActionConfig({
        commit: { conventional: true, title: "Mom's spaghetti" },
      });

      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("commit.conventional is disabled and no commit title is specified", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { conventional: false } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).not.toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("commit.conventional is disabled and a commit title is specified", () => {
      const instance: ActionConfig = new ActionConfig({
        commit: { conventional: false, title: "Yip yip!" },
      });

      expect(instance.commitTitle).toEqual("Yip yip!");
    });

    testNonBoolean("commit.conventional is '%s'", (value) => {
      const rawConfig: RawActionConfig = yaml.safeLoad(`commit:\n  - conventional: '${value}'`);

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`Unknown conventional-commits value '${value}'`),
      );
    });

    test("conventional-commits enabled and commit.conventional disabled", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "true");

      const instance: ActionConfig = new ActionConfig({ commit: { conventional: false } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).not.toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("conventional-commits disabled and commit.conventional enabled", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "false");

      const instance: ActionConfig = new ActionConfig({ commit: { conventional: true } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
    });

  });

  describe(".isDryRun", () => {

    const testNonBoolean = test.each(["foobar", "treu", "fals"]);

    beforeEach(() => {
      core.info.mockClear();
    });

    test("dry-run is not set at all", () => {
      const defaultValue = "false";
      mockCoreGetInput(INPUT_NAME_DRY_RUN, defaultValue);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'false'` in the workflow file", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'true'` in the workflow file", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "true");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(true);
    });

    testNonBoolean("dry run is `'%s'` in the workflow file", (value) => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, value);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(true);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`Unknown dry-run value '${value}'`),
      );
    });

    test("dry-run is `false` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: false");
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "true");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `true` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: true");
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

    test("dry-run is `'false'` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: 'false'");
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "true");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'true'` in the config object", () => {
      const rawConfig: RawActionConfig = yaml.safeLoad("dry-run: 'true'");
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

    testNonBoolean("dry run is `'%s'` in the config object", (value) => {
      const rawConfig: RawActionConfig = yaml.safeLoad(`dry-run: '${value}'`);
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`Unknown dry-run value '${value}'`),
      );
    });

  });

  describe(".svgoOptionsPath", () => {

    const testPaths = test.each([".svgo.yml", "foo.yml", "in/folder/config.yml"]);

    test("svgo-options is not set at all", () => {
      const defaultValue = ".svgo.yml";
      mockCoreGetInput(INPUT_NAME_SVGO_OPTIONS, defaultValue);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.svgoOptionsPath).toBe(defaultValue);
    });

    testPaths("svgo-options is set (to '%s') in the workflow file", (path) => {
      mockCoreGetInput(INPUT_NAME_SVGO_OPTIONS, path);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.svgoOptionsPath).toBe(path);
    });

    testPaths("svgo-options is set (to '%s') in the config object", (path) => {
      mockCoreGetInput(INPUT_NAME_SVGO_OPTIONS, `dir/${path}`);

      const instance: ActionConfig = new ActionConfig({ "svgo-options": path });
      expect(instance.svgoOptionsPath).toBe(path);
    });

  });

});
