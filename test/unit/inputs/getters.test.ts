import { when, resetAllWhenMocks } from "jest-when";

import inp from "../../__common__/inputter.mock";

jest.mock("../../../src/errors");

import {
  getIgnoreGlobs,
  getIsDryRun,
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
      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(configuredValue);

      const [result, err] = getIgnoreGlobs(inp, "foobar");
      expect(err).toBeNull();
      expect(result).toEqual([configuredValue]);
    });

    test.each([
      [
        "foo\nbar",
        ["foo", "bar"],
      ],
      [
        "Hello\r\nworld!",
        ["Hello", "world!"],
      ],
    ])("can get input, multi line (%#)", (configuredValues, expectedValues) => {
      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValue(configuredValues);

      const [result, err] = getIgnoreGlobs(inp, "foobar");
      expect(err).toBeNull();
      expect(result).toEqual(expectedValues);
    });

    test("can't get input", () => {
      const defaultValue = "";

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getIgnoreGlobs(inp, defaultValue);
      expect(err).toBeNull();
      expect(result).toEqual([defaultValue]);
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
      expect(result).toEqual(configuredValue);
    });

    test("can't get input", () => {
      const defaultValue = true;

      when(inp.getBooleanInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getIsDryRun(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(err).toContain("invalid dry-run value");
      expect(result).toEqual(true);
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
      expect(result).toEqual(configuredValue);
    });

    test("can't get input", () => {
      const defaultValue = "svgo.config.js";

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getSvgoConfigPath(inp, defaultValue);
      expect(err).toBeNull();
      expect(result).toEqual(defaultValue);
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
      expect(result).toEqual(configuredValue);
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
      expect(result).toEqual(defaultValue);
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
      expect(result).toEqual(defaultValue);
    });

    test("can't get input", () => {
      const defaultValue = 2;

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementation(() => { throw new Error(""); });

      const [result, err] = getSvgoVersion(inp, defaultValue);
      expect(err).toBeNull();
      expect(result).toEqual(defaultValue);
    });
  });
});
