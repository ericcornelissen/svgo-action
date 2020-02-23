import * as core from "./mocks/@actions/core.mock";

jest.mock("@actions/core", () => core);

import { getConfigurationPath, getDryRun, getRepoToken } from "../src/inputs";


describe("::getConfigurationPath", () => {

  test("return what core returns", () => {
    const expected = core.getInput("configuration-path");
    const actual = getConfigurationPath();
    expect(actual).toEqual(expected);
  });

});

describe("::getDryRun", () => {

  beforeEach(() => {
    core.info.mockClear();
  });

  test("dry-run is 'false'", () => {
    core.getInput.mockReturnValueOnce("false");

    const actual = getDryRun();
    expect(actual).toBeFalsy();
  });

  test("dry-run is 'true'", () => {
    core.getInput.mockReturnValueOnce("true");

    const actual = getDryRun();
    expect(actual).toBeTruthy();
  });

  test.each([
    "foobar",
    "treu",
    "fals",
  ])("dry run is '%s'", async (value) => {
    core.getInput.mockReturnValueOnce(value);

    const actual = getDryRun();
    expect(actual).toBeTruthy();
    expect(core.info).toHaveBeenCalledTimes(1);
  });

});

describe("::getRepoToken", () => {

  test("return what core returns", () => {
    const expected = core.getInput("repo-token");
    const actual = getRepoToken();
    expect(actual).toEqual(expected);
  });

});
