import { mocked } from "ts-jest/utils";
import { debug as _debug, error as _error } from "@actions/core";

import {
  PR_NOT_FOUND,

  getPrFile as _getPrFile,
  getPrFiles as _getPrFiles,
  getPrNumber as _getPrNumber,
} from "../src/github-api";

jest.mock("@actions/core", () => require("./mocks/@actions/core"));
jest.mock("@actions/github", () => require("./mocks/@actions/github"));
jest.mock("../src/github-api");

import main from "../src/main";


const coreError = mocked(_error, true);
const coreDebug = mocked(_debug, true);

const getPrFile = mocked(_getPrFile, true);
const getPrFiles = mocked(_getPrFiles, true);
const getPrNumber = mocked(_getPrNumber, true);


beforeEach(() => {
  coreDebug.mockClear();
  coreError.mockClear();

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
    await main();
    expect(getPrFile).toHaveBeenCalledTimes(1);
  });

});

describe("Logging", () => {

  test("does some debug logging", async () => {
    await main();
    expect(coreDebug).toHaveBeenCalled();
  });

  test("don't log an error when everything is fine", async () => {
    await main();
    expect(coreError).not.toHaveBeenCalled();
  });

  test("log an error when Pull Request number could not be found", async () => {
    getPrNumber.mockReturnValueOnce(PR_NOT_FOUND);

    await main();
    expect(coreError).toHaveBeenCalled();
  });

});
