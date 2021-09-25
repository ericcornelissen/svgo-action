import { when, resetAllWhenMocks } from "jest-when";

import inp from "../../__common__/inputter.mock";

jest.mock("../../../src/errors");

import {
  getIgnoreGlobs,
  getIsDryRun,
  getIsStrictMode,
  getSvgoConfigPath,
  getSvgoVersion,
} from "../../../src/inputs/getters";

describe("inputs/getters.ts", () => {
  beforeEach(() => {
    resetAllWhenMocks();
  });

  describe("::getIgnoreGlobs", () => {
    const inputKey = "ignore";

    beforeEach(() => {
      inp.getInput.mockClear();
    });

    test.each([
      "foobar",
      "Hello world!",
    ])("can get input, single line ('%s')", (configuredValue) => {
      when(inp.getMultilineInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue([configuredValue]);

      const [result, err] = getIgnoreGlobs(inp, []);
      expect(err).toBeNull();
      expect(result.value).toEqual([configuredValue]);
    });

    test.each([
      [["foo", "bar"]],
      [["Hello", "world!"]],
    ])("can get input, multi line (%#)", (configuredValues) => {
      when(inp.getMultilineInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(configuredValues);

      const [result, err] = getIgnoreGlobs(inp, []);
      expect(err).toBeNull();
      expect(result.value).toEqual(configuredValues);
    });

    test("can't get input", () => {
      const defaultValue = [];

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getIgnoreGlobs(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toEqual(defaultValue);
    });
  });

  describe("::getIsDryRun", () => {
    const inputKey = "dry-run";

    beforeEach(() => {
      inp.getBooleanInput.mockClear();
    });

    test.each([
      true,
      false,
    ])("can get input (`%p`)", (configuredValue) => {
      when(inp.getBooleanInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(configuredValue);

      const [result, err] = getIsDryRun(inp, !configuredValue);
      expect(err).toBeNull();
      expect(result.value).toEqual(configuredValue);
    });

    test.each([true, false])("can't get input", (defaultValue) => {
      when(inp.getBooleanInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getIsDryRun(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(err).toContain("invalid dry-run value");
      expect(result.value).toEqual(true);
    });
  });

  describe("::getIsStrictMode", () => {
    const inputKey = "strict";

    beforeEach(() => {
      inp.getBooleanInput.mockClear();
    });

    test.each([
      true,
      false,
    ])("can get input (`%p`)", (configuredValue) => {
      when(inp.getBooleanInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(configuredValue);

      const [result, err] = getIsStrictMode(inp, !configuredValue);
      expect(err).toBeNull();
      expect(result.value).toEqual(configuredValue);
    });

    test.each([true, false])("can't get input", (defaultValue) => {
      when(inp.getBooleanInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementation(() => { throw new Error(); });

      const [result, err] = getIsStrictMode(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(err).toContain("invalid strict value");
      expect(result.value).toEqual(true);
    });
  });

  describe("::getSvgoConfigPath", () => {
    const inputKey = "svgo-config";

    beforeEach(() => {
      inp.getInput.mockClear();
    });

    test.each([
      ".svgo.yml",
      "svgo.config.js",
    ])("can get input ('%s')", (configuredValue) => {
      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(configuredValue);

      const [result, err] = getSvgoConfigPath(inp, "foo.bar");
      expect(err).toBeNull();
      expect(result.value).toEqual(configuredValue);
    });

    test("can't get input", () => {
      const defaultValue = "svgo.config.js";

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getSvgoConfigPath(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toEqual(defaultValue);
    });
  });

  describe("::getSvgoVersion", () => {
    const inputKey = "svgo-version";

    beforeEach(() => {
      inp.getInput.mockClear();
    });

    test.each([
      1,
      2,
    ])("can get input, valid (`%d`)", (configuredValue) => {
      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(`${configuredValue}`);

      const [result, err] = getSvgoVersion(inp, configuredValue === 1 ? 2 : 1);
      expect(err).toBeNull();
      expect(result.value).toEqual(configuredValue);
    });

    test.each([
      "0",
      "3",
      "42",
    ])("can get input, unsupported ('%s')", (configuredValue) => {
      const defaultValue = 2;

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(configuredValue);

      const [result, err] = getSvgoVersion(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(err).toContain("unsupported SVGO version");
      expect(result.value).toEqual(defaultValue);
    });

    test.each([
      "foobar",
      "Hello world",
    ])("can get input, invalid ('%s')", (configuredValue) => {
      const defaultValue = 2;

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(configuredValue);

      const [result, err] = getSvgoVersion(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(err).toContain("invalid SVGO version");
      expect(result.value).toEqual(defaultValue);
    });

    test("can't get input", () => {
      const defaultValue = 2;

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getSvgoVersion(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toEqual(defaultValue);
    });
  });
});
