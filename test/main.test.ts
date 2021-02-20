import { when } from "jest-when";

import actionOptions from "./fixtures/svgo-action.json";
import contentPayloads from "./fixtures/contents-payloads.json";
import svgoV1Options from "./fixtures/svgo-v1-options.json";
import svgoV2Options from "./fixtures/svgo-v2-options.json";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import * as githubAPI from "./mocks/github-api.mock";
import * as inputs from "./mocks/inputs.mock";
import * as svgo from "./mocks/svgo.mock";

const prEventMain = jest.fn().mockName("pull-request.ts::main");
const pushEventMain = jest.fn().mockName("push.ts::main");
const scheduleEventMain = jest.fn().mockName("schedule.ts::main");

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);
jest.mock("../src/events/pull-request", () => prEventMain);
jest.mock("../src/events/push", () => pushEventMain);
jest.mock("../src/events/schedule", () => scheduleEventMain);
jest.mock("../src/github-api", () => githubAPI);
jest.mock("../src/inputs", () => inputs);
jest.mock("../src/svgo", () => svgo);

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
  INPUT_NAME_CONFIG_PATH,
} from "../src/constants";
import main from "../src/main";


const ALL_EVENTS = [EVENT_PULL_REQUEST, EVENT_PUSH, EVENT_SCHEDULE];


beforeEach(() => {
  core.setFailed.mockClear();

  prEventMain.mockClear();
  pushEventMain.mockClear();
  scheduleEventMain.mockClear();
});

test("push event", async () => {
  github.context.eventName = EVENT_PUSH;

  await main();
  expect(pushEventMain).toHaveBeenCalledTimes(1);
});

test("pull_request event", async () => {
  github.context.eventName = EVENT_PULL_REQUEST;

  await main();
  expect(prEventMain).toHaveBeenCalledTimes(1);
});

test("schedule event", async () => {
  github.context.eventName = EVENT_SCHEDULE;

  await main();
  expect(scheduleEventMain).toHaveBeenCalledTimes(1);
});

test("push event error", async () => {
  github.context.eventName = EVENT_PUSH;

  pushEventMain.mockImplementationOnce(() => {
    throw new Error("Something went wrong");
  });

  await main();
  expect(pushEventMain).toHaveBeenCalledTimes(1);
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test("pull_request event error", async () => {
  github.context.eventName = EVENT_PULL_REQUEST;

  prEventMain.mockImplementationOnce(() => {
    throw new Error("Something went wrong");
  });

  await main();
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test("schedule event error", async () => {
  github.context.eventName = EVENT_SCHEDULE;

  scheduleEventMain.mockImplementationOnce(() => {
    throw new Error("Something went wrong");
  });

  await main();
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test("unknown event", async () => {
  github.context.eventName = "UnKnOwN eVeNt";

  await main();
  expect(pushEventMain).not.toHaveBeenCalled();
  expect(prEventMain).not.toHaveBeenCalled();
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test.each(ALL_EVENTS)("dry mode enabled (%s)", async (eventName) => {
  github.context.eventName = eventName;

  inputs.ActionConfig.mockImplementationOnce(() => {
    return { svgoOptionsPath: ".svgo.yml", isDryRun: true };
  });

  await main();
  expect(core.info).toHaveBeenCalledWith(expect.stringContaining("Dry mode enabled"));
});

test.each(ALL_EVENTS)("use custom configuration file (%s)", async (eventName) => {
  github.context.eventName = eventName;

  const actionConfigFilePath = "svgo-action.yml";
  when(core.getInput)
    .calledWith(INPUT_NAME_CONFIG_PATH, { required: false })
    .mockReturnValueOnce(actionConfigFilePath);

  await main();

  expect(inputs.ActionConfig).toHaveBeenCalledWith(core, actionOptions);
});

test.each(ALL_EVENTS)("use a YAML SVGO options file in the repository (%s)", async (eventName) => {
  svgo.SVGOptimizer.mockClear();

  github.context.eventName = eventName;

  const { svgoOptionsPath } = new inputs.ActionConfig();
  when(githubAPI.getFile)
    .calledWith(github.GitHubInstance, github.context.sha, svgoOptionsPath)
    .mockResolvedValueOnce(contentPayloads.files[".svgo.yml"]);

  await main();

  expect(svgo.SVGOptimizer).toHaveBeenCalledWith(1, svgoV1Options);
});

test.each(ALL_EVENTS)("use a JavaScript SVGO options file in the repository (%s)", async (eventName) => {
  svgo.SVGOptimizer.mockClear();

  github.context.eventName = eventName;

  inputs.ActionConfig.mockImplementationOnce(() => {
    return { svgoOptionsPath: ".svgo.js", svgoVersion: 1 };
  });

  when(githubAPI.getFile)
    .calledWith(github.GitHubInstance, github.context.sha, ".svgo.js")
    .mockResolvedValueOnce(contentPayloads.files[".svgo.js"]);

  await main();

  expect(svgo.SVGOptimizer).toHaveBeenCalledWith(1, svgoV2Options);
});

test("use a JavaScript SVGO options file that does not exist", async () => {
  svgo.SVGOptimizer.mockClear();

  github.context.eventName = EVENT_PUSH;

  inputs.ActionConfig.mockImplementationOnce(() => {
    return { svgoOptionsPath: ".svgo.js", svgoVersion: 1 };
  });

  when(githubAPI.getFile)
    .calledWith(github.GitHubInstance, github.context.sha, ".svgo.js")
    .mockRejectedValueOnce(new Error("Not found"));

  await main();

  expect(svgo.SVGOptimizer).toHaveBeenCalledWith(1, expect.any(Object));
});

test.each([1, 2])("set SVGO version", async (svgoVersion) => {
  inputs.ActionConfig.mockImplementationOnce(() => {
    return { svgoOptionsPath: ".svgo.yml", svgoVersion: svgoVersion };
  });

  await main();

  expect(svgo.SVGOptimizer).toHaveBeenCalledWith(svgoVersion, expect.any(Object));
});

test.each(ALL_EVENTS)("the Action configuration file does not exist (%s)", async (eventName) => {
  github.context.eventName = eventName;

  const actionConfigPath = core.getInput(INPUT_NAME_CONFIG_PATH);
  when(githubAPI.getFile)
    .calledWith(github.GitHubInstance, github.context.sha, actionConfigPath)
    .mockRejectedValueOnce(new Error("Not found"));

  await main();

  expect(core.setFailed).not.toHaveBeenCalled();
  expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(`not found.*${actionConfigPath}`));
});

test.each(ALL_EVENTS)("the SVGO options file does not exist (%s)", async (eventName) => {
  github.context.eventName = eventName;

  const { svgoOptionsPath } = new inputs.ActionConfig();
  when(githubAPI.getFile)
    .calledWith(github.GitHubInstance, github.context.sha, svgoOptionsPath)
    .mockRejectedValueOnce(new Error("Not found"));

  await main();

  expect(core.setFailed).not.toHaveBeenCalled();
  expect(core.debug).toHaveBeenCalledWith(expect.stringMatching(`not found.*${svgoOptionsPath}`));
});
