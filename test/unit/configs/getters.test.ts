import { when } from "jest-when";

import inp from "../../__mocks__/inputter.mock";

import {
  getIgnoreGlob,
  getIsDryRun,
  getSvgoConfigPath,
  getSvgoVersion,
} from "../../../src/configs/getters";

describe("config/getters.ts", () => {
  describe("::getIgnoreGlob", () => {
    const inputKey = "ignore";

    test.each([
      "foobar",
      "Hello world!",
    ])("can get input", (configuredValue) => {
      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValueOnce(configuredValue);

      const [result, err] = getIgnoreGlob(inp);
      expect(err).toBeNull();
      expect(result).toEqual(configuredValue);
    });

    test("can't get input", () => {
      const expected = "";

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementationOnce(() => { throw new Error(""); });

      const [result, err] = getIgnoreGlob(inp);
      expect(err).not.toBeNull();
      expect(result).toEqual(expected);
    });
  });

  describe("::getIsDryRun", () => {
    const inputKey = "dry-run";

    test.each([
      true,
      false,
    ])("can get input", (configuredValue) => {
      when(inp.getBooleanInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValueOnce(configuredValue);

      const [result, err] = getIsDryRun(inp);
      expect(err).toBeNull();
      expect(result).toEqual(configuredValue);
    });

    test("can't get input", () => {
      const expected = true;

      when(inp.getBooleanInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementationOnce(() => { throw new Error(""); });

      const [result, err] = getIsDryRun(inp);
      expect(err).not.toBeNull();
      expect(result).toEqual(expected);
    });
  });

  describe("::getSvgoConfigPath", () => {
    const inputKey = "svgo-config";

    test.each([
      ".svgo.yml",
      "svgo.config.js",
    ])("can get input", (configuredValue) => {
      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValueOnce(configuredValue);

      const [result, err] = getSvgoConfigPath(inp);
      expect(err).toBeNull();
      expect(result).toEqual(configuredValue);
    });

    test("can't get input", () => {
      const expected = "svgo.config.js";

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementationOnce(() => { throw new Error(""); });

      const [result, err] = getSvgoConfigPath(inp);
      expect(err).not.toBeNull();
      expect(result).toEqual(expected);
    });
  });

  describe("::getSvgoVersion", () => {
    const inputKey = "svgo-version";

    test.each([
      1,
      2,
    ])("can get input, valid", (configuredValue) => {
      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValueOnce(`${configuredValue}`);

      const [result, err] = getSvgoVersion(inp);
      expect(err).toBeNull();
      expect(result).toEqual(configuredValue);
    });

    test.each([
      "42",
      "foobar",
    ])("can get input, invalid", (configuredValue) => {
      const expected = 2;

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockReturnValueOnce(configuredValue);

      const [result, err] = getSvgoVersion(inp);
      expect(err).not.toBeNull();
      expect(result).toEqual(expected);
    });

    test("can't get input", () => {
      const expected = 2;

      when(inp.getInput)
        .calledWith(inputKey, expect.anything())
        .mockImplementationOnce(() => { throw new Error(""); });

      const [result, err] = getSvgoVersion(inp);
      expect(err).not.toBeNull();
      expect(result).toEqual(expected);
    });
  });
});
