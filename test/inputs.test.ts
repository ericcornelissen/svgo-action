import { when } from "jest-when";

import * as core from "./mocks/@actions/core.mock";

import {
  DEFAULT_COMMENT,
  INPUT_NAME_COMMENT,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_SVGO_OPTIONS,
  INPUT_NAME_SVGO_VERSION,
} from "../src/constants";
import { ActionConfig } from "../src/inputs";
import { RawActionConfig } from "../src/types";


function mockCoreGetInput(key: string, value: string): void {
  when(core.getInput)
    .calledWith(key, expect.any(Object))
    .mockReturnValue(value);
}


describe("ActionConfig", () => {

  const nonBooleanStrings: string[] = ["foobar", "treu", "fals"];

  describe("::constructor", () => {

    test("construct without a parameter", () => {
      expect(() => new ActionConfig(core)).not.toThrow();
    });

    test("construct without an empty object", () => {
      expect(() => new ActionConfig(core, { })).not.toThrow();
    });

    test("construct with an object specifying dry-run", () => {
      const config: RawActionConfig = { "dry-run": true };
      expect(() => new ActionConfig(core, config)).not.toThrow();
    });

  });

  describe(".comment", () => {

    test("comment is set to `'true'` in the Workflow file", () => {
      mockCoreGetInput(INPUT_NAME_COMMENT, "true");

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.comment).toEqual(DEFAULT_COMMENT);
    });

    test.each([
      "Hello world!",
      "{{ svgCount }} SVG(s) were optimized, you're welcome :)",
    ])("comment is set to a template in the Workflow file ('%s')", (template) => {
      mockCoreGetInput(INPUT_NAME_COMMENT, template);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.comment).toEqual(template);
    });

    test("comment is `true` in the config object", () => {
      const rawConfig = { comment: true };
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.comment).toEqual(DEFAULT_COMMENT);
    });

    test("comment is `'true'` in the config object", () => {
      const rawConfig = { comment: "true" };
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.comment).toEqual(DEFAULT_COMMENT);
    });

    test.each([
      "foobar",
      "{{ svgCount }} SVG(s) were optimized :sparkles:",
    ])("comment is set to a template in the config object ('%s')", (template) => {
      const rawConfig = { comment: template };
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.comment).toEqual(template);
    });

  });

  describe(".enableComments", () => {

    test("comment is not set at all", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const defaultValue = "false";
      mockCoreGetInput(INPUT_NAME_COMMENT, defaultValue);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.enableComments).toBe(false);
    });

    test("comment is `'false'` in the Workflow file", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.enableComments).toBe(false);
    });

    test("comment is `'true'` in the Workflow file", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");
      mockCoreGetInput(INPUT_NAME_COMMENT, "true");

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.enableComments).toBe(true);
    });

    test.each(nonBooleanStrings)("comment is `'%s'` in the Workflow file", (value) => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");
      mockCoreGetInput(INPUT_NAME_COMMENT, value);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.enableComments).toBe(true);
    });

    test("comment is `false` in the config object", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const rawConfig = { comment: false };
      mockCoreGetInput(INPUT_NAME_COMMENT, "true");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.enableComments).toBe(false);
    });

    test("comment is `true` in the config object", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const rawConfig = { comment: true };
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.enableComments).toBe(true);
    });

    test("comment is `'false'` in the config object", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const rawConfig = { comment: "false" };
      mockCoreGetInput(INPUT_NAME_COMMENT, "true");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.enableComments).toBe(false);
    });

    test("comment is `'true'` in the config object", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const rawConfig = { comment: "true" };
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.enableComments).toBe(true);
    });

    test.each(nonBooleanStrings)("comment is `'%s'` in the config object", (value) => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const rawConfig = { comment: value };
      mockCoreGetInput(INPUT_NAME_COMMENT, "false");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.enableComments).toBe(true);
    });

    test.each(["true", "false"])("dry-run is true and comment is `%s`", (value) => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "true");
      mockCoreGetInput(INPUT_NAME_COMMENT, value);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.enableComments).toBe(false);
    });

  });

  describe(".isDryRun", () => {

    test("dry-run is not set at all", () => {
      const defaultValue = "false";
      mockCoreGetInput(INPUT_NAME_DRY_RUN, defaultValue);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'false'` in the workflow file", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'true'` in the workflow file", () => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "true");

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.isDryRun).toBe(true);
    });

    test.each(nonBooleanStrings)("dry-run is `'%s'` in the workflow file", (value) => {
      mockCoreGetInput(INPUT_NAME_DRY_RUN, value);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.isDryRun).toBe(true);
    });

    test("dry-run is `false` in the config object", () => {
      const rawConfig = { "dry-run": false };
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "true");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `true` in the config object", () => {
      const rawConfig = { "dry-run": true };
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

    test("dry-run is `'false'` in the config object", () => {
      const rawConfig = { "dry-run": "false" } as unknown as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "true");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.isDryRun).toBe(false);
    });

    test("dry-run is `'true'` in the config object", () => {
      const rawConfig = { "dry-run": "true" } as unknown as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

    test.each(nonBooleanStrings)("dry-run is `'%s'` in the config object", (value) => {
      const rawConfig = { "dry-run": value } as unknown as RawActionConfig;
      mockCoreGetInput(INPUT_NAME_DRY_RUN, "false");

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.isDryRun).toBe(true);
    });

  });

  describe(".ignoreGlob", () => {

    const globs: string[] = ["file.svg", "dir/*", "folder/**/*"];

    test("dry-run is not set at all", () => {
      const defaultValue = "";
      mockCoreGetInput(INPUT_NAME_IGNORE, defaultValue);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.ignoreGlob).toBe("");
    });

    test.each(globs)("ignore is '%s' in the workflow file", (glob) => {
      mockCoreGetInput(INPUT_NAME_IGNORE, glob);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.ignoreGlob).toBe(glob);
    });

    test.each(globs)("ignore is '%s' in the config file", (glob) => {
      const defaultValue = "";
      const rawConfig: RawActionConfig = { ignore: glob };
      mockCoreGetInput(INPUT_NAME_IGNORE, defaultValue);

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.ignoreGlob).toBe(glob);
    });

    test.each([
      ["foo.svg", "bar.svg"],
      ["dir/*", "folder/*"],
      ["folder/**/*", "dir/**/*"],
    ])("ignore is '%s' in the workflow file and '%s' in the config file", (workflowGlob, configGlob) => {
      const rawConfig: RawActionConfig = { ignore: configGlob };
      mockCoreGetInput(INPUT_NAME_DRY_RUN, workflowGlob);

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.ignoreGlob).toBe(configGlob);
    });

  });

  describe(".svgoOptionsPath", () => {

    const paths: string[] = ["svgo.config.js", "foo.js", "in/folder/config.js"];

    test("svgo-options is not set at all", () => {
      const defaultValue = "svgo.config.js";
      mockCoreGetInput(INPUT_NAME_SVGO_OPTIONS, defaultValue);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.svgoOptionsPath).toBe(defaultValue);
    });

    test.each(paths)("svgo-options is set (to '%s') in the workflow file", (path) => {
      mockCoreGetInput(INPUT_NAME_SVGO_OPTIONS, path);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.svgoOptionsPath).toBe(path);
    });

    test.each(paths)("svgo-options is set (to '%s') in the config object", (path) => {
      mockCoreGetInput(INPUT_NAME_SVGO_OPTIONS, `dir/${path}`);

      const instance: ActionConfig = new ActionConfig(core, { "svgo-options": path });
      expect(instance.svgoOptionsPath).toBe(path);
    });

  });

  describe(".svgoVersion", () => {

    const defaultValue = "2";

    test("not configured", () => {
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, defaultValue);

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.svgoVersion).toBe(2);
    });

    test("set to `'1'` in workflow file", () => {
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, "1");

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.svgoVersion).toBe(1);
    });

    test("set to `'2'` in workflow file", () => {
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, "2");

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.svgoVersion).toBe(2);
    });

    test("set to neither `'1'` or `'2'` in workflow file", () => {
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, "3");

      const instance: ActionConfig = new ActionConfig(core);
      expect(instance.svgoVersion).toBe(2);
    });

    test("set to `1` in config file", () => {
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, defaultValue);
      const rawConfig: RawActionConfig = { "svgo-version": 1 };

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.svgoVersion).toBe(1);
    });

    test("set to `2` in config file", () => {
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, defaultValue);
      const rawConfig: RawActionConfig = { "svgo-version": 2 };

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.svgoVersion).toBe(2);
    });

    test("set to `'1'` in config file", () => {
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, defaultValue);
      const rawConfig = { "svgo-version": "1" } as unknown as RawActionConfig;

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.svgoVersion).toBe(1);
    });

    test("set to `'2'` in config file", () => {
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, defaultValue);
      const rawConfig = { "svgo-version": "2" } as unknown as RawActionConfig;

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.svgoVersion).toBe(2);
    });

    test("set to neither `1` or `2` in config file", () => {
      const defaultValue = "1";
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, defaultValue);
      const rawConfig: RawActionConfig = { "svgo-version": 3 };

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.svgoVersion).toBe(2);
    });

    test("set to `1` in config file and something else in workflow file", () => {
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, "2");
      const rawConfig: RawActionConfig = { "svgo-version": 1 };

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.svgoVersion).toBe(1);
    });

    test("set to `2` in config file and something else in workflow file", () => {
      mockCoreGetInput(INPUT_NAME_SVGO_VERSION, "1");
      const rawConfig: RawActionConfig = { "svgo-version": 2 };

      const instance: ActionConfig = new ActionConfig(core, rawConfig);
      expect(instance.svgoVersion).toBe(2);
    });

  });

});
