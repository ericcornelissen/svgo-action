import { when } from "jest-when";

import * as core from "./mocks/@actions/core.mock";

import {
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_SVGO_OPTIONS,
  INPUT_NAME_SVGO_VERSION,
} from "../src/constants";
import { ActionConfig } from "../src/inputs";

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
  });

  describe(".ignoreGlob", () => {
    const globs: string[] = ["file.svg", "dir/*", "folder/**/*"];

    test("ignore is not set at all", () => {
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
  });
});
