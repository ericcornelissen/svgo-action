import * as core from "./mocks/@actions/core.mock";
import { PR_WITH_ONE_SVG_CHANGED } from "./mocks/@actions/github.mock";
import * as githubAPI from "./mocks/github-api.mock";

jest.mock("@actions/core", () => core);
jest.mock("../src/github-api", () => githubAPI);

import { PR_NOT_FOUND } from "../src/github-api";
import main from "../src/main";


beforeEach(() => {
  core.debug.mockClear();
  core.error.mockClear();
  core.setFailed.mockClear();

  githubAPI.getPrFile.mockClear();
  githubAPI.getPrFiles.mockClear();
  githubAPI.getPrNumber.mockClear();
});

describe("Return value", () => {

  test("return success if everything is OK", async () => {
    const result: boolean = await main();
    expect(result).toBeTruthy();
  });

  test("return failure when Pull Request number as not found", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NOT_FOUND);

    const result: boolean = await main();
    expect(result).toBeFalsy();
  });

});

describe("Function usage", () => {

  test("gets the Pull Request number", async () => {
    await main();
    expect(githubAPI.getPrNumber).toHaveBeenCalledTimes(1);
  });

  test("gets the changed files in the Pull Request", async () => {
    await main();
    expect(githubAPI.getPrFiles).toHaveBeenCalledTimes(1);
  });

  test("gets the contents of at least one of the files in the Pull Request", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_WITH_ONE_SVG_CHANGED);

    await main();
    expect(githubAPI.getPrFile).toHaveBeenCalledTimes(1);
  });

});

describe("Logging", () => {

  test("does some debug logging", async () => {
    await main();
    expect(core.debug).toHaveBeenCalled();
  });

  test("don't log an error when everything is fine", async () => {
    await main();
    expect(core.error).not.toHaveBeenCalled();
  });

  test("don't set a failed state when everything is fine", async () => {
    await main();
    expect(core.setFailed).not.toHaveBeenCalled();
  });

  test("log an error when Pull Request number could not be found", async () => {
    githubAPI.getPrNumber.mockReturnValueOnce(PR_NOT_FOUND);

    await main();
    expect(core.error).toHaveBeenCalled();
  });

});
