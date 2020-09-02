import { when } from "jest-when";

import actionOptions from "./fixtures/svgo-action.json";
import contentPayloads from "./fixtures/contents-payloads.json";
import svgoOptions from "./fixtures/svgo-options.json";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import * as githubAPI from "./mocks/github-api.mock";
import * as inputs from "./mocks/inputs.mock";
import prsMain from "./mocks/pull-request.mock";
import pushMain from "./mocks/push.mock";
import * as svgo from "./mocks/svgo.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);
jest.mock("../src/events/pull-request", () => prsMain);
jest.mock("../src/events/push", () => pushMain);
jest.mock("../src/github-api", () => githubAPI);
jest.mock("../src/inputs", () => inputs);
jest.mock("../src/svgo", () => svgo);

import { EVENT_PULL_REQUEST, EVENT_PUSH } from "../src/constants";
import main from "../src/main";


const ALL_EVENTS = [EVENT_PULL_REQUEST, EVENT_PUSH];


beforeEach(() => {
  core.setFailed.mockClear();

  prsMain.mockClear();
  pushMain.mockClear();

  svgo.SVGOptimizer.mockClear();
});

test("push event", async () => {
  github.context.eventName = EVENT_PUSH;

  await main();
  expect(pushMain).toHaveBeenCalledTimes(1);
});

test("pull_request event", async () => {
  github.context.eventName = EVENT_PULL_REQUEST;

  await main();
  expect(prsMain).toHaveBeenCalledTimes(1);
});

test("push event error", async () => {
  github.context.eventName = EVENT_PUSH;

  pushMain.mockImplementationOnce(() => {
    throw new Error("Something went wrong");
  });

  await main();
  expect(pushMain).toHaveBeenCalledTimes(1);
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test("pull_request event error", async () => {
  github.context.eventName = EVENT_PULL_REQUEST;

  prsMain.mockImplementationOnce(() => {
    throw new Error("Something went wrong");
  });

  await main();
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test("unknown event", async () => {
  github.context.eventName = "UnKnOwN eVeNt";

  await main();
  expect(pushMain).not.toHaveBeenCalled();
  expect(prsMain).not.toHaveBeenCalled();
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test.each(ALL_EVENTS)("dry mode enabled (%s)", async (eventName) => {
  github.context.eventName = eventName;

  inputs.ActionConfig.mockImplementationOnce(() => {
    return { isDryRun: true };
  });

  await main();
  expect(core.info).toHaveBeenCalledWith(expect.stringContaining("Dry mode enabled"));
});

test.each(ALL_EVENTS)("use custom configuration file (%s)", async (eventName) => {
  github.context.eventName = eventName;

  const actionConfigFilePath = "svgo-action.yml";
  inputs.getConfigFilePath.mockReturnValueOnce(actionConfigFilePath);

  await main();

  expect(inputs.ActionConfig).toHaveBeenCalledWith(actionOptions);
});

test.each(ALL_EVENTS)("use an SVGO options file in the repository (%s)", async (eventName) => {
  github.context.eventName = eventName;

  const { svgoOptionsPath } = new inputs.ActionConfig();
  when(githubAPI.getRepoFile)
    .calledWith(github.GitHubInstance, svgoOptionsPath)
    .mockResolvedValueOnce(contentPayloads[".svgo.yml"]);

  await main();

  expect(svgo.SVGOptimizer).toHaveBeenCalledWith(svgoOptions);
});

test.each(ALL_EVENTS)("the Action configuration file does not exist (%s)", async (eventName) => {
  github.context.eventName = eventName;

  const actionConfigPath = inputs.getConfigFilePath();
  when(githubAPI.getRepoFile)
    .calledWith(github.GitHubInstance, actionConfigPath)
    .mockRejectedValueOnce(new Error("Not found"));

  await main();

  expect(core.setFailed).not.toHaveBeenCalled();
  expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(`not found.*${actionConfigPath}`));
});

test.each(ALL_EVENTS)("the SVGO options file does not exist (%s)", async (eventName) => {
  github.context.eventName = eventName;

  const { svgoOptionsPath } = new inputs.ActionConfig();
  when(githubAPI.getRepoFile)
    .calledWith(github.GitHubInstance, svgoOptionsPath)
    .mockRejectedValueOnce(new Error("Not found"));

  await main();

  expect(core.setFailed).not.toHaveBeenCalled();
  expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(`not found.*${svgoOptionsPath}`));
});
