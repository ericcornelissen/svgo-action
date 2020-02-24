import * as core from "./mocks/@actions/core.mock";

jest.mock("@actions/core", () => core);

import { getConfigurationPath, getDryRun, getRepoToken } from "../src/inputs";


describe("::getConfigurationPath", () => {

  test("return what core returns", () => {
    const expected = core.getInput("configuration-path");
    const result = getConfigurationPath();
    expect(result).toEqual(expected);
  });

});

describe("::getDryRun", () => {

  beforeEach(() => {
    core.info.mockClear();
  });

  test("dry-run is 'false'", () => {
    core.getInput.mockReturnValueOnce("false");

    const result = getDryRun();
    expect(result).toBeFalsy();
  });

  test("dry-run is 'true'", () => {
    core.getInput.mockReturnValueOnce("true");

    const result = getDryRun();
    expect(result).toBeTruthy();
  });

  test.each([
    "foobar",
    "treu",
    "fals",
  ])("dry run is '%s'", async (value) => {
    core.getInput.mockReturnValueOnce(value);

    const result = getDryRun();
    expect(result).toBeTruthy();
    expect(core.info).toHaveBeenCalledTimes(1);
  });

});

describe("::getRepoToken", () => {

  test("return what core returns", () => {
    const expected = core.getInput("repo-token");
    const result = getRepoToken();
    expect(result).toEqual(expected);
  });

});
