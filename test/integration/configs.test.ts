import { when, resetAllWhenMocks } from "jest-when";

import inp from "../__mocks__/inputter.mock";

import configs from "../../src/configs";

const DRY_RUN = "dry-run";
const IGNORE = "ignore";
const SVGO_OPTIONS = "svgo-options";
const SVGO_VERSION = "svgo-version";

describe("package configs", () => {
  beforeEach(() => {
    inp.getBooleanInput.mockReset();
    inp.getInput.mockReset();

    resetAllWhenMocks();
  });

  describe("::New", () => {
    beforeEach(() => {
      when(inp.getInput)
        .calledWith(IGNORE, expect.anything())
        .mockReturnValue("");

      when(inp.getBooleanInput)
        .calledWith(DRY_RUN, expect.anything())
        .mockReturnValue(false);

      when(inp.getInput)
        .calledWith(SVGO_OPTIONS, expect.anything())
        .mockReturnValue("svgo.config.js");

      when(inp.getInput)
        .calledWith(SVGO_VERSION, expect.anything())
        .mockReturnValue("2");
    });

    describe("::ignoreGlob", () => {
      const defaultIgnoreGlob = "";

      function doMockIgnoreInput(fn: () => string): void {
        when(inp.getInput)
          .calledWith(IGNORE, expect.anything())
          .mockImplementation(fn);
      }

      test("not configured", async () => {
        doMockIgnoreInput(() => defaultIgnoreGlob);

        const [config, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(config.ignoreGlob).toEqual(defaultIgnoreGlob);
      });

      test.each([
        "foo",
        "bar",
      ])("configured to '%s'", async (value) => {
        doMockIgnoreInput(() => value);

        const [config, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(config.ignoreGlob).toEqual(value);
      });

      test("configured incorrectly", async () => {
        doMockIgnoreInput(() => { throw new Error(); });

        const [config, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(config.ignoreGlob).toEqual("");
      });
    });

    describe("::isDryRun", () => {
      const defaultDryRun = false;

      function doMockDryRunInput(fn: () => boolean): void {
        when(inp.getBooleanInput)
          .calledWith(DRY_RUN, expect.anything())
          .mockImplementation(fn);
      }

      test("not configured", async () => {
        doMockDryRunInput(() => defaultDryRun);

        const [config, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(config.isDryRun).toEqual(defaultDryRun);
      });

      test.each([true, false])("configured to `%p`", async (value) => {
        doMockDryRunInput(() => value);

        const [config, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(config.isDryRun).toEqual(value);
      });

      test("configured incorrectly", async () => {
        doMockDryRunInput(() => { throw new Error(); });

        const [config, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(config.isDryRun).toEqual(true);
      });
    });

    describe("::svgoOptionsPath", () => {
      const defaultSvgoOptionsPath = "svgo.config.js";

      function doMockSvgoOptionsInput(fn: () => string): void {
        when(inp.getInput)
          .calledWith(SVGO_OPTIONS, expect.anything())
          .mockImplementation(fn);
      }

      test("not configured", async () => {
        doMockSvgoOptionsInput(() => defaultSvgoOptionsPath);

        const [config, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(config.svgoOptionsPath).toEqual(defaultSvgoOptionsPath);
      });

      test.each([
        "svgo.config.js",
        ".svgo.yml",
      ])("configured to '%s'", async (value) => {
        doMockSvgoOptionsInput(() => value);

        const [config, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(config.svgoOptionsPath).toEqual(value);
      });

      test("configured incorrectly", async () => {
        doMockSvgoOptionsInput(() => { throw new Error(); });

        const [config, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(config.svgoOptionsPath).toEqual("svgo.config.js");
      });
    });

    describe("::svgoVersion", () => {
      const defaultSvgoVersion = 2;

      function doMockSvgoVersionInput(fn: () => string): void {
        when(inp.getInput)
          .calledWith(SVGO_VERSION, expect.anything())
          .mockImplementation(fn);
      }

      test("not configured", async () => {
        doMockSvgoVersionInput(() => `${defaultSvgoVersion}`);

        const [config, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(config.svgoVersion).toEqual(defaultSvgoVersion);
      });

      test.each([
        1,
        2,
      ])("configured to '%s' (valid)", async (value) => {
        doMockSvgoVersionInput(() => `${value}`);

        const [config, err] = configs.New({ inp });

        expect(err).toBeNull();
        expect(config.svgoVersion).toEqual(value);
      });

      test.each([
        "42",
        "3.14",
        "Hello world!",
      ])("configured to '%s' (invalid)", async (value) => {
        doMockSvgoVersionInput(() => value);

        const [config, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(config.svgoVersion).toEqual(defaultSvgoVersion);
      });

      test("configured incorrectly", async () => {
        doMockSvgoVersionInput(() => { throw new Error(); });

        const [config, err] = configs.New({ inp });

        expect(err).not.toBeNull();
        expect(config.svgoVersion).toEqual(defaultSvgoVersion);
      });
    });
  });
});
