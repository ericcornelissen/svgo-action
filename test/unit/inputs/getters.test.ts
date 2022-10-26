import { when, resetAllWhenMocks } from "jest-when";

jest.mock("../../../src/errors");

import {
  getIgnoreGlobs,
  getIsDryRun,
  getIsStrictMode,
  getSvgoConfigPath,
  getSvgoVersion,
} from "../../../src/inputs/getters";
import { SupportedSvgoVersions } from "../../../src/svgo";
import inp from "../../__common__/inputter.mock";

describe("inputs/getters.ts", () => {
  const INPUT_OPTIONS_NOT_REQUIRED = { required: false };
  const INPUT_OPTIONS_REQUIRED = { required: true };

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
      expect(result.provided).toBe(true);
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
      expect(result.provided).toBe(true);
    });

    test("input provided but invalid", () => {
      const defaultValue = [];

      when(inp.getMultilineInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_NOT_REQUIRED),
        )
        .mockImplementation(() => { throw new Error(""); });
      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_REQUIRED),
        )
        .mockReturnValue("invalid");

      const [result, err] = getIgnoreGlobs(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toEqual(defaultValue);
      expect(result.provided).toBe(true);
    });

    test("input not provided", () => {
      const defaultValue = [];

      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_REQUIRED),
        )
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getIgnoreGlobs(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toEqual(defaultValue);
      expect(result.provided).toBe(false);
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
      expect(result.value).toBe(configuredValue);
      expect(result.provided).toBe(true);
    });

    test.each([
      true,
      false,
    ])("input provided but invalid", (defaultValue) => {
      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_REQUIRED),
        )
        .mockReturnValue("invalid");
      when(inp.getBooleanInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_NOT_REQUIRED),
        )
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getIsDryRun(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(err).toContain("invalid dry-run value");
      expect(result.value).toBe(true);
      expect(result.provided).toBe(true);
    });

    test.each([
      true,
      false,
    ])("input not provided", (defaultValue) => {
      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_REQUIRED),
        )
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getIsDryRun(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toBe(defaultValue);
      expect(result.provided).toBe(false);
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
      expect(result.value).toBe(configuredValue);
      expect(result.provided).toBe(true);
    });

    test.each([
      true,
      false,
    ])("input provided but invalid", (defaultValue) => {
      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_REQUIRED),
        )
        .mockReturnValue("invalid");
      when(inp.getBooleanInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_NOT_REQUIRED),
        )
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getIsStrictMode(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(err).toContain("invalid strict value");
      expect(result.value).toBe(true);
    });

    test.each([
      true,
      false,
    ])("input not provided", (defaultValue) => {
      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_REQUIRED),
        )
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getIsStrictMode(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toBe(defaultValue);
      expect(result.provided).toBe(false);
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
      expect(result.value).toBe(configuredValue);
      expect(result.provided).toBe(true);
    });

    test("input provided but invalid", () => {
      const defaultValue = "svgo.config.js";

      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_REQUIRED),
        )
        .mockReturnValue("invalid");
      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_NOT_REQUIRED),
        )
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getSvgoConfigPath(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toBe(defaultValue);
      expect(result.provided).toBe(true);
    });

    test("input not provided", () => {
      const defaultValue = "svgo.config.js";

      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_REQUIRED),
        )
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getSvgoConfigPath(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toBe(defaultValue);
      expect(result.provided).toBe(false);
    });
  });

  describe("::getSvgoVersion", () => {
    const inputKey = "svgo-version";

    beforeEach(() => {
      inp.getInput.mockClear();
    });

    test.each([
      ["2", "project"],
      ["3", "2"],
      ["project", "2"],
    ])("can get input, valid ('%s')", (configuredValue, _defaultValue) => {
      expect(configuredValue).not.toEqual(_defaultValue);
      const defaultValue = _defaultValue as SupportedSvgoVersions;

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(`${configuredValue}`);

      const [result, err] = getSvgoVersion(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toBe(configuredValue);
    });

    test.each([
      "0",
      "4",
      "42",
    ])("can get input, unsupported ('%s')", (configuredValue) => {
      const defaultValue = "2";

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(configuredValue);

      const [result, err] = getSvgoVersion(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(err).toContain("unsupported SVGO version");
      expect(result.value).toBe(defaultValue);
      expect(result.provided).toBe(true);
    });

    test("input provided but invalid", () => {
      const defaultValue = "2";

      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_REQUIRED),
        )
        .mockReturnValue("invalid");
      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_NOT_REQUIRED),
        )
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getSvgoVersion(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toBe(defaultValue);
      expect(result.provided).toBe(true);
    });

    test("input not provided", () => {
      const defaultValue = "2";

      when(inp.getInput)
        .calledWith(
          inputKey,
          expect.objectContaining(INPUT_OPTIONS_REQUIRED),
        )
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getSvgoVersion(inp, defaultValue);
      expect(err).toBeNull();
      expect(result.value).toBe(defaultValue);
      expect(result.provided).toBe(false);
    });
  });
});
