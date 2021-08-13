import { when, resetAllWhenMocks } from "jest-when";

import inp from "../../__common__/inputter.mock";

jest.mock("../../../src/errors");

import {
  getIgnoreGlob,
  getIsDryRun,
  getSvgoConfigPath,
  getSvgoVersion,
} from "../../../src/inputs/getters";

describe("inputs/getters.ts", () => {
  beforeEach(() => {
    resetAllWhenMocks();
  });

  describe("::getIgnoreGlob", () => {
    const inputKey = "ignore";

    test.each([
      "foobar",
      "Hello world!",
    ])("can get input ('%s')", (configuredValue) => {
      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValueOnce(configuredValue);

      const [result, err] = getIgnoreGlob(inp, "foobar");
      expect(err).toBeNull();
      expect(result).toEqual(configuredValue);
    });

    test("can't get input", () => {
      const defaultValue = "";

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementationOnce(() => { throw new Error(""); });

      const [result, err] = getIgnoreGlob(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(result).toEqual(defaultValue);
    });
  });

  describe("::getIsDryRun", () => {
    const inputKey = "dry-run";

    test.each([
      true,
      false,
    ])("can get input (`%p`)", (configuredValue) => {
      when(inp.getBooleanInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValueOnce(configuredValue);

      const [result, err] = getIsDryRun(inp, !configuredValue);
      expect(err).toBeNull();
      expect(result).toEqual(configuredValue);
    });

    test("can't get input", () => {
      const defaultValue = true;

      when(inp.getBooleanInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementationOnce(() => { throw new Error(""); });

      const [result, err] = getIsDryRun(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(result).toEqual(defaultValue);
    });
  });

  describe("::getSvgoConfigPath", () => {
    const inputKey = "svgo-config";

    test.each([
      ".svgo.yml",
      "svgo.config.js",
    ])("can get input ('%s')", (configuredValue) => {
      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValueOnce(configuredValue);

      const [result, err] = getSvgoConfigPath(inp, "foo.bar");
      expect(err).toBeNull();
      expect(result).toEqual(configuredValue);
    });

    test("can't get input", () => {
      const defaultValue = "svgo.config.js";

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementationOnce(() => { throw new Error(""); });

      const [result, err] = getSvgoConfigPath(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(result).toEqual(defaultValue);
    });
  });

  describe("::getSvgoVersion", () => {
    const inputKey = "svgo-version";

    test.each([
      1,
      2,
    ])("can get input, valid (`%d`)", (configuredValue) => {
      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValueOnce(`${configuredValue}`);

      const [result, err] = getSvgoVersion(inp, configuredValue === 1 ? 2 : 1);
      expect(err).toBeNull();
      expect(result).toEqual(configuredValue);
    });

    test.each([
      "42",
      "foobar",
    ])("can get input, invalid ('%s')", (configuredValue) => {
      const defaultValue = 2;

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValueOnce(configuredValue);

      const [result, err] = getSvgoVersion(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(result).toEqual(defaultValue);
    });

    test("can't get input", () => {
      const defaultValue = 2;

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementationOnce(() => { throw new Error(""); });

      const [result, err] = getSvgoVersion(inp, defaultValue);
      expect(err).not.toBeNull();
      expect(result).toEqual(defaultValue);
    });
  });
});
