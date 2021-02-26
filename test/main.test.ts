import { when } from "jest-when";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";
import * as githubAPI from "./mocks/github-api.mock";
import * as fs from "./mocks/file-system.mock";
import * as inputs from "./mocks/inputs.mock";
import * as optimize from "./mocks/optimize.mock";
import * as outputs from "./mocks/outputs.mock";
import * as parser from "./mocks/parser.mock";
import * as skipRun from "./mocks/skip-run.mock";
import * as svgo from "./mocks/svgo.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);
jest.mock("../src/github-api", () => githubAPI);
jest.mock("../src/file-system", () => fs);
jest.mock("../src/inputs", () => inputs);
jest.mock("../src/optimize", () => optimize);
jest.mock("../src/outputs", () => outputs);
jest.mock("../src/parser", () => parser);
jest.mock("../src/skip-run", () => skipRun);
jest.mock("../src/svgo", () => svgo);

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
  INPUT_NAME_CONFIG_PATH,
  NOT_REQUIRED,
} from "../src/constants";
import main from "../src/main";


const ALL_EVENTS = [EVENT_PULL_REQUEST, EVENT_PUSH, EVENT_SCHEDULE];
const SKIPPABLE_EVENTS = [EVENT_PULL_REQUEST, EVENT_PUSH];


beforeEach(() => {
  core.debug.mockClear();
  core.setFailed.mockClear();

  optimize.optimize.mockClear();

  skipRun.shouldSkipRun.mockResolvedValue({ shouldSkip: false });
});

test("push event", async () => {
  github.context.eventName = EVENT_PUSH;

  await main();
  expect(optimize.optimize).toHaveBeenCalled();
});

test("pull_request event", async () => {
  github.context.eventName = EVENT_PULL_REQUEST;

  await main();
  expect(optimize.optimize).toHaveBeenCalled();
});

test("schedule event", async () => {
  github.context.eventName = EVENT_SCHEDULE;

  await main();
  expect(optimize.optimize).toHaveBeenCalled();
});

test("push event error", async () => {
  github.context.eventName = EVENT_PUSH;

  optimize.optimize.mockImplementationOnce(() => {
    throw new Error("Something went wrong");
  });

  await main();
  expect(optimize.optimize).toHaveBeenCalledTimes(1);
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test("pull_request event error", async () => {
  github.context.eventName = EVENT_PULL_REQUEST;

  optimize.optimize.mockImplementationOnce(() => {
    throw new Error("Something went wrong");
  });

  await main();
  expect(optimize.optimize).toHaveBeenCalledTimes(1);
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test("schedule event error", async () => {
  github.context.eventName = EVENT_SCHEDULE;

  optimize.optimize.mockImplementationOnce(() => {
    throw new Error("Something went wrong");
  });

  await main();
  expect(optimize.optimize).toHaveBeenCalledTimes(1);
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test("unknown event", async () => {
  github.context.eventName = "UnKnOwN eVeNt";

  await main();
  expect(optimize.optimize).not.toHaveBeenCalled();
  expect(core.setFailed).toHaveBeenCalledTimes(1);
});

test.each(ALL_EVENTS)("dry mode enabled (%s)", async (eventName) => {
  github.context.eventName = eventName;


  inputs.ActionConfig.mockImplementationOnce(() => {
    return { svgoOptionsPath: "svgo.config.js", isDryRun: true };
  });

  await main();
  expect(core.info).toHaveBeenCalledWith(expect.stringContaining("Dry mode enabled"));
});

test.each(ALL_EVENTS)("use custom configuration file (%s)", async (eventName) => {
  fs.readFile.mockClear();
  parser.parseYaml.mockClear();
  svgo.SVGOptimizer.mockClear();

  github.context.eventName = eventName;

  const actionConfigFilePath = "svgo-action.yml";
  const actionConfigFileContent = "dry-run: true\n";
  const actionConfig = { "dry-run": true };

  when(core.getInput)
    .calledWith(INPUT_NAME_CONFIG_PATH, NOT_REQUIRED)
    .mockReturnValueOnce(actionConfigFilePath);
  when(fs.readFile)
    .calledWith(actionConfigFilePath)
    .mockReturnValueOnce(actionConfigFileContent);
  when(parser.parseYaml)
    .calledWith(actionConfigFileContent)
    .mockReturnValueOnce(actionConfig);

  await main();

  expect(fs.readFile).toHaveBeenCalledWith(actionConfigFilePath);
  expect(parser.parseYaml).toHaveBeenCalledWith(actionConfigFileContent);
  expect(inputs.ActionConfig).toHaveBeenCalledWith(core, actionConfig);
});

test.each(ALL_EVENTS)("use a JavaScript SVGO options file in the repository (%s)", async (eventName) => {
  fs.readFile.mockClear();
  parser.parseJavaScript.mockClear();
  svgo.SVGOptimizer.mockClear();

  github.context.eventName = eventName;

  const svgoOptionsFilePath = "svgo.config.js";
  const svgoOptionsFileContent = "module.exports = { }";
  const svgoOptions = { multipass: true, plugins: [] };

  inputs.ActionConfig.mockImplementationOnce(() => {
    return { svgoOptionsPath: svgoOptionsFilePath, svgoVersion: 2 };
  });
  when(fs.readFile)
    .calledWith(svgoOptionsFilePath)
    .mockReturnValueOnce(svgoOptionsFileContent);
  when(parser.parseJavaScript)
    .calledWith(svgoOptionsFileContent)
    .mockReturnValueOnce(svgoOptions);

  await main();

  expect(fs.readFile).toHaveBeenCalledWith(svgoOptionsFilePath);
  expect(parser.parseJavaScript).toHaveBeenCalledWith(svgoOptionsFileContent);
  expect(svgo.SVGOptimizer).toHaveBeenCalledWith(2, svgoOptions);
});

test.each(ALL_EVENTS)("use a YAML SVGO options file in the repository (%s)", async (eventName) => {
  fs.readFile.mockClear();
  parser.parseYaml.mockClear();
  svgo.SVGOptimizer.mockClear();

  github.context.eventName = eventName;

  const svgoOptionsFilePath = ".svgo.yml";
  const svgoOptionsFileContent = "multipass: true\nplugins:\n- removeDoctype";
  const svgoOptions = { multipass: true, plugins: ["removeDoctype"] };

  inputs.ActionConfig.mockImplementationOnce(() => {
    return { svgoOptionsPath: svgoOptionsFilePath, svgoVersion: 2 };
  });
  when(fs.readFile)
    .calledWith(svgoOptionsFilePath)
    .mockReturnValueOnce(svgoOptionsFileContent);
  when(parser.parseYaml)
    .calledWith(svgoOptionsFileContent)
    .mockReturnValueOnce(svgoOptions);

  await main();

  expect(fs.readFile).toHaveBeenCalledWith(svgoOptionsFilePath);
  expect(parser.parseYaml).toHaveBeenCalledWith(svgoOptionsFileContent);
  expect(svgo.SVGOptimizer).toHaveBeenCalledWith(2, svgoOptions);
});

test.each([1, 2])("set SVGO version", async (svgoVersion) => {
  inputs.ActionConfig.mockImplementationOnce(() => {
    return { svgoOptionsPath: "svgo.config.js", svgoVersion: svgoVersion };
  });

  await main();

  expect(svgo.SVGOptimizer).toHaveBeenCalledWith(svgoVersion, undefined);
  expect(core.info).toHaveBeenCalledWith(expect.stringMatching(`SVGO.*${svgoVersion}`));
});

test.each(SKIPPABLE_EVENTS)("the Action is skipped (%s)", async (eventName) => {
  github.context.eventName = eventName;

  skipRun.shouldSkipRun.mockResolvedValue({ shouldSkip: true });

  await main();

  expect(core.setFailed).not.toHaveBeenCalled();
  expect(core.info).toHaveBeenCalledWith(expect.stringMatching("Action disabled"));
});

test.each(ALL_EVENTS)("the Action configuration file does not exist (%s)", async (eventName) => {
  core.warning.mockClear();
  core.setFailed.mockClear();

  github.context.eventName = eventName;

  const actionConfigFilePath = core.getInput(INPUT_NAME_CONFIG_PATH);

  when(fs.readFile)
    .calledWith(actionConfigFilePath)
    .mockRejectedValueOnce(new Error("Not found"));

  await main();

  expect(core.setFailed).not.toHaveBeenCalled();
  expect(core.warning).toHaveBeenCalledWith(
    expect.stringMatching("Action config file '.*' not found or invalid"),
  );
});

test.each(ALL_EVENTS)("the Action configuration file is invalid (%s)", async (eventName) => {
  core.warning.mockClear();
  core.setFailed.mockClear();

  github.context.eventName = eventName;

  const actionConfigFilePath = core.getInput(INPUT_NAME_CONFIG_PATH);
  const actionConfigFileContent = "foobar";

  when(fs.readFile)
    .calledWith(actionConfigFilePath)
    .mockResolvedValueOnce(actionConfigFileContent);
  when(parser.parseYaml)
    .calledWith(actionConfigFileContent)
    .mockImplementation(() => { throw new Error("Not found"); });

  await main();

  expect(core.setFailed).not.toHaveBeenCalled();
  expect(core.warning).toHaveBeenCalledWith(
    expect.stringMatching("Action config file '.*' not found or invalid"),
  );
});

test.each([
  [1, "svgo.config.js"],
  [2, "svgo.config.js"],
  [1, ".svgo.yml"],
  [2, ".svgo.yml"],
])("use a SVGO config file that does not exist (%s, %s)", async (version, filePath) => {
  core.warning.mockClear();
  core.setFailed.mockClear();
  svgo.SVGOptimizer.mockClear();

  github.context.eventName = EVENT_PUSH;

  inputs.ActionConfig.mockImplementationOnce(() => {
    return { svgoOptionsPath: filePath, svgoVersion: version };
  });

  when(fs.readFile)
    .calledWith(filePath)
    .mockRejectedValueOnce(new Error("Not found"));

  await main();

  expect(core.setFailed).not.toHaveBeenCalled();
  expect(core.warning).toHaveBeenCalledWith(
    expect.stringMatching("SVGO config file '.*' not found or invalid"),
  );
  expect(svgo.SVGOptimizer).toHaveBeenCalledWith(version, undefined);
});

test.each([
  [1, "svgo.config.js"],
  [2, "svgo.config.js"],
  [1, ".svgo.yml"],
  [2, ".svgo.yml"],
])("use a SVGO config file that is invalid (%s, %s)", async (version, filePath) => {
  core.warning.mockClear();
  core.setFailed.mockClear();
  svgo.SVGOptimizer.mockClear();

  github.context.eventName = EVENT_PUSH;

  const invalidContent = "foobar";

  inputs.ActionConfig.mockImplementationOnce(() => {
    return { svgoOptionsPath: filePath, svgoVersion: version };
  });

  when(fs.readFile)
    .calledWith(filePath)
    .mockResolvedValueOnce(invalidContent);
  when(parser.parseJavaScript)
    .calledWith(invalidContent)
    .mockImplementation(() => { throw new Error("Not found"); });
  when(parser.parseYaml)
    .calledWith(invalidContent)
    .mockImplementation(() => { throw new Error("Not found"); });

  await main();

  expect(core.setFailed).not.toHaveBeenCalled();
  expect(core.warning).toHaveBeenCalledWith(
    expect.stringMatching("SVGO config file '.*' not found or invalid"),
  );
  expect(svgo.SVGOptimizer).toHaveBeenCalledWith(version, undefined);
});
