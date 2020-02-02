import { mocked } from "ts-jest/utils";

import prPayloads from "./fixtures/pull-request-payloads.json";
import * as core from "./mocks/@actions/core";
import * as githubMock from "./mocks/@actions/github";

import {
  PR_NOT_FOUND,

  FileInfo,

  getPrFile as _getPrFile,
  getPrFiles as _getPrFiles,
  getPrNumber as _getPrNumber,
} from "../src/github-api";

jest.mock("@actions/core", () => core);
jest.mock("../src/github-api");

import main from "../src/main";


const PR_WITH_ONE_SVG_CHANGED = 2;


const getPrFile = mocked(_getPrFile, true);
const getPrFiles = mocked(_getPrFiles, true);
const getPrNumber = mocked(_getPrNumber, true);


beforeAll(() => {
  const client = new githubMock.GitHub();

  getPrNumber.mockReturnValue(42);
  getPrFiles.mockImplementation((_, prNumber) => {
    if (prNumber === PR_WITH_ONE_SVG_CHANGED) {
      const filesInfo: FileInfo[] = prPayloads["1 SVG added"].map(details => ({
        path: details.filename,
        status: details.status,
      }));

      return Promise.resolve(filesInfo);
    } else {
      return Promise.resolve([]);
    }
  });
});

beforeEach(() => {
  core.debug.mockClear();
  core.error.mockClear();
  core.setFailed.mockClear();

  getPrFile.mockClear();
  getPrFiles.mockClear();
  getPrNumber.mockClear();
});

describe("Return value", () => {

  test("return success if everything is OK", async () => {
    const result: boolean = await main();
    expect(result).toBeTruthy();
  });

  test("return failure when Pull Request number as not found", async () => {
    getPrNumber.mockReturnValueOnce(PR_NOT_FOUND);

    const result: boolean = await main();
    expect(result).toBeFalsy();
  });

});

describe("Function usage", () => {

  test("calls a relevant function", async () => {
    await main();
    expect(getPrNumber).toHaveBeenCalledTimes(1);
  });

  test("calls a relevant function II", async () => {
    await main();
    expect(getPrFiles).toHaveBeenCalledTimes(1);
  });

  test("calls a relevant function III", async () => {
    getPrNumber.mockReturnValueOnce(PR_WITH_ONE_SVG_CHANGED);

    await main();
    expect(getPrFile).toHaveBeenCalledTimes(1);
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
    getPrNumber.mockReturnValueOnce(PR_NOT_FOUND);

    await main();
    expect(core.error).toHaveBeenCalled();
  });

});
