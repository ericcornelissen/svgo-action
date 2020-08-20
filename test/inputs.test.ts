import { when } from "jest-when";
import * as yaml from "js-yaml";

import * as core from "./mocks/@actions/core.mock";

jest.mock("@actions/core", () => core);

import {
  DEFAULT_COMMIT_BODY,
  DEFAULT_COMMIT_TITLE,
  DEFAULT_COMMENT,
  INPUT_NAME_COMMENT,
  INPUT_NAME_CONFIG_PATH,
  INPUT_NAME_CONVENTIONAL_COMMITS,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_REPO_TOKEN,
  INPUT_NAME_SVGO_OPTIONS,
} from "../src/constants";
import { ActionConfig, getConfigFilePath, getRepoToken } from "../src/inputs";
import { RawActionConfig } from "../src/types";


function mockCoreGetInput(key: string, value: string): void {
  when(core.getInput)
    .calledWith(key, expect.any(Object))
    .mockReturnValue(value);
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

  const nonBooleanStrings: string[] = ["foobar", "treu", "fals"];

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

  describe(".comment", () => {

    test("comment is set to `'true'` in the Workflow file", () => {
      mockCoreGetInput(INPUT_NAME_COMMENT, "true");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.comment).toEqual(DEFAULT_COMMENT);
    });

    test.each([
      "Hello world!",
      "{{ svgCount }} SVG(s) were optimized, you're welcome :)",
    ])("comment is set to a template in the Workflow file ('%s')", (template) => {
      mockCoreGetInput(INPUT_NAME_COMMENT, template);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.comment).toEqual(template);
    });

    test("comment is `true` in the config object", () => {
      const rawConfig = yaml.safeLoad("comment: true") as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.comment).toEqual(DEFAULT_COMMENT);
    });

    test("comment is `'true'` in the config object", () => {
      const rawConfig = yaml.safeLoad("comment: 'true'") as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.comment).toEqual(DEFAULT_COMMENT);
    });

    test.each([
      "foobar",
      "{{ svgCount }} SVG(s) were optimized :sparkles:",
    ])("comment is set to a template in the config object ('%s')", (template) => {
      const rawConfig = yaml.safeLoad(`comment: "${template}"`) as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.comment).toEqual(template);
    });

  });

  describe(".commitBody", () => {

    test("commit is not defined in the config object", () => {
      const instance: ActionConfig = new ActionConfig({ });
      expect(instance.commitBody).toEqual(DEFAULT_COMMIT_BODY);
    });

    test("commit is defined in the config object, but the body isn't", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { } });
      expect(instance.commitBody).toEqual(DEFAULT_COMMIT_BODY);
    });

    test.each([
      "This is a commit message body",
      "This is templated commit message body {{optimizedCount}}",
      "These are not the droids you're looking for",
    ])("commit message body is defined in the config object", (body) => {
      const instance: ActionConfig = new ActionConfig({ commit: { body } });
      expect(instance.commitBody).toEqual(body);
    });

    test("commit message body is an empty string in the config object", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { body: "" } });
      expect(instance.commitBody).toBeDefined();
      expect(instance.commitBody).toEqual("");
    });

  });

  describe(".commitTitle", () => {

    const CONVENTIONAL_COMMIT_EXP = /.+:\s.+/;

    test("commit is not defined in the config object", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "false");

      const instance: ActionConfig = new ActionConfig({ });
      expect(instance.commitTitle).toEqual(DEFAULT_COMMIT_TITLE);
    });

    test("commit is defined in the config object, but the title isn't", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { } });
      expect(instance.commitTitle).toBeDefined();
    });

    test.each([
      "This is a commit message title",
      "This is templated commit message title {{optimizedCount}}",
      "If you see a rat the size of a car, you're playing the wrong game",
    ])("commit message title is defined in the config object", (title) => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "false");

      const instance: ActionConfig = new ActionConfig({ commit: { title } });
      expect(instance.commitTitle).toEqual(title);
    });

    test("commit message title is an empty string in the config object", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { title: "" } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).toEqual(DEFAULT_COMMIT_TITLE);
    });

    test("conventional-commits is enabled and no commit message title is specified", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "true");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("conventional-commits is enabled and a commit message title is specified", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "true");

      const instance: ActionConfig = new ActionConfig({ commit: { title: "deadbeef" } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("conventional-commits is disabled and no commit message title is specified", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "false");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).toEqual(DEFAULT_COMMIT_TITLE);
    });

    test("conventional-commits is disabled and a commit message title is specified", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "false");

      const instance: ActionConfig = new ActionConfig({ commit: { title: "Do the thing" } });
      expect(instance.commitTitle).toEqual("Do the thing");
    });

    test.each(nonBooleanStrings)("conventional-commits is '%s'", (value) => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, value);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`Unknown conventional-commits value '${value}'`),
      );
    });

    test("commit.conventional is enabled and no commit message title is specified", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { conventional: true } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("commit.conventional is enabled and a commit message title is specified", () => {
      const instance: ActionConfig = new ActionConfig({
        commit: { conventional: true, title: "Mom's spaghetti" },
      });

      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
    });

    test("commit.conventional is disabled and no commit message title is specified", () => {
      const instance: ActionConfig = new ActionConfig({ commit: { conventional: false } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).toEqual(DEFAULT_COMMIT_TITLE);
    });

    test("commit.conventional is disabled and a commit message title is specified", () => {
      const instance: ActionConfig = new ActionConfig({
        commit: { conventional: false, title: "Yip yip!" },
      });

      expect(instance.commitTitle).toEqual("Yip yip!");
    });

    test.each(nonBooleanStrings)("commit.conventional is '%s'", (value) => {
      const rawConfig = yaml.safeLoad(`commit:\n  - conventional: '${value}'`) as RawActionConfig;

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
      expect(instance.commitTitle).toEqual(DEFAULT_COMMIT_TITLE);
    });

    test("conventional-commits disabled and commit.conventional enabled", () => {
      mockCoreGetInput(INPUT_NAME_CONVENTIONAL_COMMITS, "false");

      const instance: ActionConfig = new ActionConfig({ commit: { conventional: true } });
      expect(instance.commitTitle).toBeDefined();
      expect(instance.commitTitle).not.toEqual("");
      expect(instance.commitTitle).toMatch(CONVENTIONAL_COMMIT_EXP);
    });

  });

  describe(".enableComments", () => {

    beforeEach(() => {
      core.info.mockClear();
    });

    test("comment is not set at all", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const defaultValue = "false";
      mockCoreGetInput(INPUT_NAME_COMMENT, defaultValue);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.enableComments).toBe(false);
    });

    test("comment is `'false'` in the Workflow file", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.enableComments).toBe(false);
    });

    test("comment is `'true'` in the Workflow file", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");
      mockCoreGetInput(INPUT_NAME_COMMENT, "true");

      const instance: ActionConfig = new ActionConfig();
      expect(instance.enableComments).toBe(true);
    });

    test.each(nonBooleanStrings)("comment is `'%s'` in the Workflow file", (value) => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");
      mockCoreGetInput(INPUT_NAME_COMMENT, value);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.enableComments).toBe(true);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`Unknown comment value '${value}'`),
      );
    });

    test("comment is `false` in the config object", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const rawConfig = yaml.safeLoad("comment: false") as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_COMMENT, "true");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.enableComments).toBe(false);
    });

    test("comment is `true` in the config object", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const rawConfig = yaml.safeLoad("comment: true") as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.enableComments).toBe(true);
    });

    test("comment is `'false'` in the config object", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const rawConfig = yaml.safeLoad("comment: 'false'") as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_COMMENT, "true");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.enableComments).toBe(false);
    });

    test("comment is `'true'` in the config object", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const rawConfig = yaml.safeLoad("comment: 'true'") as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.enableComments).toBe(true);
    });

    test.each(nonBooleanStrings)("comment is `'%s'` in the config object", (value) => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const rawConfig = yaml.safeLoad(`comment: '${value}'`) as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.enableComments).toBe(true);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`Unknown comment value '${value}'`),
      );
    });

    test.each(["true", "false"])("dry-run is true and commit is `%s`", (value) => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "true");
      mockCoreGetInput(INPUT_NAME_COMMENT, value);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.enableComments).toBe(false);
    });

  });

  describe(".isDryRun", () => {

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

    test.each(nonBooleanStrings)("dry-run is `'%s'` in the workflow file", (value) => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, value);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.isDryRun).toBe(true);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`Unknown dry-run value '${value}'`),
      );
    });

    test("dry-run is `false` in the config object", () => {
      const rawConfig = yaml.safeLoad("dry-run: false") as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "true");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `true` in the config object", () => {
      const rawConfig = yaml.safeLoad("dry-run: true") as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

    test("dry-run is `'false'` in the config object", () => {
      const rawConfig = yaml.safeLoad("dry-run: 'false'") as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "true");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'true'` in the config object", () => {
      const rawConfig = yaml.safeLoad("dry-run: 'true'") as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

    test.each(nonBooleanStrings)("dry-run is `'%s'` in the config object", (value) => {
      const rawConfig = yaml.safeLoad(`dry-run: '${value}'`) as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.isDryRun).toBe(true);
      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`Unknown dry-run value '${value}'`),
      );
    });

  });

  describe(".ignoreGlob", () => {

    const testGlobs = test.each(["file.svg", "dir/*", "folder/**/*"]);

    test("dry-run is not set at all", () => {
      const defaultValue = "";
      mockCoreGetInput(INPUT_NAME_IGNORE, defaultValue);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.ignoreGlob).toBe("");
    });

    testGlobs("ignore is '%s' in the workflow file", (glob) => {
      mockCoreGetInput(INPUT_NAME_IGNORE, glob);

      const instance: ActionConfig = new ActionConfig();
      expect(instance.ignoreGlob).toBe(glob);
    });

    testGlobs("ignore is '%s' in the config file", (glob) => {
      const defaultValue = "";
      const rawConfig: RawActionConfig = { ignore: glob };
      mockCoreGetInput(INPUT_NAME_IGNORE, defaultValue);

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.ignoreGlob).toBe(glob);
    });

    test.each([
      ["foo.svg", "bar.svg"],
      ["dir/*", "folder/*"],
      ["folder/**/*", "dir/**/*"],
    ])("ignore is '%s' in the workflow file and '%s' in the config file", (workflowGlob, configGlob) => {
      const rawConfig: RawActionConfig = { ignore: configGlob };
      mockCoreGetInput(INPUT_NAME_DRY_RUN, workflowGlob);

      const instance: ActionConfig = new ActionConfig(rawConfig);
      expect(instance.ignoreGlob).toBe(configGlob);
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
