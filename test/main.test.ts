import * as core from "@actions/core";

import * as githubAPI from "../src/github-api";

jest.mock("@actions/core", () => require("./mocks/@actions/core"));
jest.mock("@actions/github", () => require("./mocks/@actions/github"));
jest.mock("../src/github-api");

import { main } from "../src/main";


test("return success", async () => {
  const result: boolean = await main();
  expect(result).toBeTruthy();
});

test("calls a relevant function", async () => {
  await main();
  expect(githubAPI.getPrNumber).toHaveBeenCalled();
});

test("does some debug logging", async () => {
  await main();
  expect(core.debug).toHaveBeenCalled();
});

test("does not log an error when everything is fine", async () => {
  await main();
  expect(core.error).not.toHaveBeenCalled();
});
