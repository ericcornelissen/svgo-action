import { when, resetAllWhenMocks } from "jest-when";

import inputs from "../../src/inputs";
import inp from "../__common__/inputter.mock";

describe("package inputs", () => {
  const DRY_RUN = "dry-run";
  const IGNORE = "ignore";
  const SVGO_CONFIG = "svgo-config";
  const SVGO_VERSION = "svgo-version";

  const DEFAULT_IGNORE = [];
  const DEFAULT_DRY_RUN = false;
  const DEFAULT_SVGO_CONFIG = "svgo.config.js";
  const DEFAULT_SVGO_VERSION = "2";

  beforeEach(() => {
    inp.getBooleanInput.mockReset();
    inp.getInput.mockReset();

    resetAllWhenMocks();
  });

  beforeEach(() => {
    when(inp.getMultilineInput)
      .calledWith(IGNORE, expect.anything())
      .mockReturnValue(DEFAULT_IGNORE);

    when(inp.getBooleanInput)
      .calledWith(DRY_RUN, expect.anything())
      .mockReturnValue(DEFAULT_DRY_RUN);

    when(inp.getInput)
      .calledWith(SVGO_CONFIG, expect.anything())
      .mockReturnValue(DEFAULT_SVGO_CONFIG);

    when(inp.getInput)
      .calledWith(SVGO_VERSION, expect.anything())
      .mockReturnValue(`${DEFAULT_SVGO_VERSION}`);
  });

  describe("::ignoreGlobs", () => {
    function doMockIgnoreInput(fn: () => string[]): void {
      when(inp.getMultilineInput)
        .calledWith(IGNORE, expect.anything())
        .mockImplementation(fn);
    }

    test("not configured", async () => {
      doMockIgnoreInput(() => { throw new Error(); });

      const [config, err] = inputs.New({ inp });

      expect(err).toBeNull();
      expect(config.ignoreGlobs.value).toEqual(DEFAULT_IGNORE);
    });

    test.each([
      "foo",
      "bar",
    ])("configured to '%s'", async (value) => {
      doMockIgnoreInput(() => [value]);

      const [config, err] = inputs.New({ inp });

      expect(err).toBeNull();
      expect(config.ignoreGlobs.value).toEqual([value]);
    });
  });

  describe("::isDryRun", () => {
    function doMockDryRunInput(fn: () => boolean): void {
      when(inp.getInput)
        .calledWith(DRY_RUN, expect.anything())
        .mockImplementation(() => `${fn()}`);
      when(inp.getBooleanInput)
        .calledWith(DRY_RUN, expect.anything())
        .mockImplementation(fn);
    }

    test("not configured", async () => {
      doMockDryRunInput(() => { throw new Error(); });

      const [config, err] = inputs.New({ inp });

      expect(err).toBeNull();
      expect(config.isDryRun.value).toBe(DEFAULT_DRY_RUN);
    });

    test.each([true, false])("configured to `%p`", async (value) => {
      doMockDryRunInput(() => value);

      const [config, err] = inputs.New({ inp });

      expect(err).toBeNull();
      expect(config.isDryRun.value).toBe(value);
    });
  });

  describe("::svgoConfigPath", () => {
    function doMockSvgoConfigInput(fn: () => string): void {
      when(inp.getInput)
        .calledWith(SVGO_CONFIG, expect.anything())
        .mockImplementation(fn);
    }

    test("not configured", async () => {
      doMockSvgoConfigInput(() => { throw new Error(); });

      const [config, err] = inputs.New({ inp });

      expect(err).toBeNull();
      expect(config.svgoConfigPath.value).toBe("svgo.config.js");
    });

    test.each([
      "svgo.config.js",
      ".svgo.yml",
    ])("configured to '%s'", async (value) => {
      doMockSvgoConfigInput(() => value);

      const [config, err] = inputs.New({ inp });

      expect(err).toBeNull();
      expect(config.svgoConfigPath.value).toBe(value);
    });
  });

  describe("::svgoVersion", () => {
    function doMockSvgoVersionInput(fn: () => string): void {
      when(inp.getInput)
        .calledWith(SVGO_VERSION, expect.anything())
        .mockImplementation(fn);
    }

    test("not configured", async () => {
      doMockSvgoVersionInput(() => { throw new Error(); });

      const [config, err] = inputs.New({ inp });

      expect(err).toBeNull();
      expect(config.svgoVersion.value).toBe(DEFAULT_SVGO_VERSION);
    });

    test.each([
      "1",
      "2",
    ])("configured to '%s' (valid)", async (value) => {
      doMockSvgoVersionInput(() => `${value}`);

      const [config, err] = inputs.New({ inp });

      expect(err).toBeNull();
      expect(config.svgoVersion.value).toBe(value);
    });

    test.each([
      "42",
      "3.14",
      "Hello world!",
    ])("configured to '%s' (invalid)", async (value) => {
      doMockSvgoVersionInput(() => value);

      const [config, err] = inputs.New({ inp });

      expect(err).not.toBeNull();
      expect(config.svgoVersion.value).toBe(DEFAULT_SVGO_VERSION);
    });
  });
});
