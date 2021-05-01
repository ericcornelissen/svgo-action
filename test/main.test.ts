import { when } from "jest-when";

import * as core from "./mocks/@actions/core.mock";
import * as fs from "./mocks/file-system.mock";
import * as inputs from "./mocks/inputs.mock";
import * as optimize from "./mocks/optimize.mock";
import * as outputs from "./mocks/outputs.mock";
import * as parser from "./mocks/parser.mock";
import * as svgo from "./mocks/svgo.mock";

jest.mock("@actions/core", () => core);
jest.mock("../src/file-system", () => fs);
jest.mock("../src/inputs", () => inputs);
jest.mock("../src/optimize", () => optimize);
jest.mock("../src/outputs", () => outputs);
jest.mock("../src/parser", () => parser);
jest.mock("../src/svgo", () => svgo);

import {
  DEFAULT_CONFIG_PATH,
  DEFAULT_SVGO_OPTIONS,
  EVENT_PUSH,
  INPUT_NAME_CONFIG_PATH,
  INPUT_NOT_REQUIRED,
  SUPPORTED_EVENTS,
} from "../src/constants";
import main from "../src/main";

const DEFAULT_CONTEXT = { eventName: EVENT_PUSH };

beforeEach(() => {
  core.debug.mockClear();
  core.setFailed.mockClear();

  optimize.optimize.mockClear();
});

describe("run & optimize", () => {
  test.each(SUPPORTED_EVENTS)("%s event", async (eventName) => {
    const context = { eventName };

    await main(context);
    expect(optimize.optimize).toHaveBeenCalled();
  });

  test.each(SUPPORTED_EVENTS)("%s event error", async (eventName) => {
    const context = { eventName };

    optimize.optimize.mockImplementationOnce(() => {
      throw new Error("Something went wrong");
    });

    await main(context);
    expect(optimize.optimize).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledTimes(1);
  });

  test("unknown event", async () => {
    const context = { eventName: "UnKnOwN eVeNt" };

    await main(context);
    expect(optimize.optimize).not.toHaveBeenCalled();
    expect(core.setFailed).toHaveBeenCalledTimes(1);
  });
});

describe("configuration", () => {
  test.each(SUPPORTED_EVENTS)("dry mode enabled (%s)", async (eventName) => {
    const context = { eventName };

    inputs.ActionConfig.mockImplementationOnce(() => {
      return { svgoOptionsPath: "svgo.config.js", isDryRun: true };
    });

    await main(context);
    expect(core.info).toHaveBeenCalledWith(expect.stringContaining("Dry mode enabled"));
  });

  test.each([1, 2])("SVGO version", async (svgoVersion) => {
    core.info.mockClear();
    svgo.SVGOptimizer.mockClear();

    inputs.ActionConfig.mockImplementationOnce(() => {
      return { svgoOptionsPath: "svgo.config.js", svgoVersion: svgoVersion };
    });

    await main(DEFAULT_CONTEXT);

    expect(svgo.SVGOptimizer).toHaveBeenCalledWith(svgoVersion, expect.anything());
    expect(core.info).toHaveBeenCalledWith(expect.stringMatching(`SVGO.*${svgoVersion}`));
  });
});

describe("Action configuration file", () => {
  test.each(SUPPORTED_EVENTS)("use custom file (%s)", async (eventName) => {
    fs.readFile.mockClear();
    parser.parseYaml.mockClear();
    svgo.SVGOptimizer.mockClear();

    const context = { eventName };

    const actionConfigFilePath = "svgo-action.yml";
    const actionConfigFileContent = "dry-run: true\n";
    const actionConfig = { "dry-run": true };

    when(core.getInput)
      .calledWith(INPUT_NAME_CONFIG_PATH, INPUT_NOT_REQUIRED)
      .mockReturnValueOnce(actionConfigFilePath);
    when(fs.readFile)
      .calledWith(actionConfigFilePath)
      .mockReturnValueOnce(actionConfigFileContent);
    when(parser.parseYaml)
      .calledWith(actionConfigFileContent)
      .mockReturnValueOnce(actionConfig);

    await main(context);

    expect(fs.readFile).toHaveBeenCalledWith(actionConfigFilePath);
    expect(parser.parseYaml).toHaveBeenCalledWith(actionConfigFileContent);
    expect(inputs.ActionConfig).toHaveBeenCalledWith(core, actionConfig);
  });

  test.each(SUPPORTED_EVENTS)("the default file does not exist (%s)", async (eventName) => {
    core.warning.mockClear();
    core.setFailed.mockClear();

    const context = { eventName };

    when(core.getInput)
      .calledWith(INPUT_NAME_CONFIG_PATH, INPUT_NOT_REQUIRED)
      .mockReturnValueOnce(DEFAULT_CONFIG_PATH);
    when(fs.readFile)
      .calledWith(DEFAULT_CONFIG_PATH)
      .mockRejectedValueOnce(new Error("Not found"));

    await main(context);

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.warning).not.toHaveBeenCalled();
  });

  test.each(SUPPORTED_EVENTS)("a custom file does not exist (%s)", async (eventName) => {
    core.warning.mockClear();
    core.setFailed.mockClear();

    const context = { eventName };

    const actionConfigFilePath = ".svgo-action.yml";
    expect(actionConfigFilePath).not.toEqual(core.getInput(INPUT_NAME_CONFIG_PATH));

    when(core.getInput)
      .calledWith(INPUT_NAME_CONFIG_PATH, INPUT_NOT_REQUIRED)
      .mockReturnValueOnce(actionConfigFilePath);
    when(fs.readFile)
      .calledWith(actionConfigFilePath)
      .mockRejectedValueOnce(new Error("Not found"));

    await main(context);

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringMatching("Action config file '.*' not found"),
    );
  });

  test.each(SUPPORTED_EVENTS)("the Action exists but is invalid (%s)", async (eventName) => {
    core.warning.mockClear();
    core.setFailed.mockClear();

    const context = { eventName };

    const actionConfigFilePath = core.getInput(INPUT_NAME_CONFIG_PATH);
    const actionConfigFileContent = "foobar";

    when(fs.readFile)
      .calledWith(actionConfigFilePath)
      .mockResolvedValueOnce(actionConfigFileContent);
    when(parser.parseYaml)
      .calledWith(actionConfigFileContent)
      .mockImplementation(() => { throw new Error("Not found"); });

    await main(context);

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringMatching("Action config file '.*' invalid"),
    );
  });
});

describe("SVGO configuration file", () => {
  test.each(SUPPORTED_EVENTS)("use a JavaScript SVGO options file in the repository (%s)", async (eventName) => {
    fs.readFile.mockClear();
    parser.parseJavaScript.mockClear();
    svgo.SVGOptimizer.mockClear();

    const context = { eventName };

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

    await main(context);

    expect(fs.readFile).toHaveBeenCalledWith(svgoOptionsFilePath);
    expect(parser.parseJavaScript).toHaveBeenCalledWith(svgoOptionsFileContent);
    expect(svgo.SVGOptimizer).toHaveBeenCalledWith(2, svgoOptions);
  });

  test.each(SUPPORTED_EVENTS)("use a YAML SVGO options file in the repository (%s)", async (eventName) => {
    fs.readFile.mockClear();
    parser.parseYaml.mockClear();
    svgo.SVGOptimizer.mockClear();

    const context = { eventName };

    const svgoOptionsFilePath = ".svgo.yml";
    const svgoOptionsFileContent = "multipass: true\nplugins:\n- removeDoctype";
    const svgoOptions = { multipass: true, plugins: ["removeDoctype"] };

    inputs.ActionConfig.mockImplementationOnce(() => {
      return { svgoOptionsPath: svgoOptionsFilePath, svgoVersion: 1 };
    });
    when(fs.readFile)
      .calledWith(svgoOptionsFilePath)
      .mockReturnValueOnce(svgoOptionsFileContent);
    when(parser.parseYaml)
      .calledWith(svgoOptionsFileContent)
      .mockReturnValueOnce(svgoOptions);

    await main(context);

    expect(fs.readFile).toHaveBeenCalledWith(svgoOptionsFilePath);
    expect(parser.parseYaml).toHaveBeenCalledWith(svgoOptionsFileContent);
    expect(svgo.SVGOptimizer).toHaveBeenCalledWith(1, svgoOptions);
  });

  test("the default SVGO config file does not exist", async () => {
    core.warning.mockClear();
    core.setFailed.mockClear();
    svgo.SVGOptimizer.mockClear();

    inputs.ActionConfig.mockImplementationOnce(() => {
      return { svgoOptionsPath: DEFAULT_SVGO_OPTIONS, svgoVersion: 2 };
    });

    when(fs.readFile)
      .calledWith(DEFAULT_SVGO_OPTIONS)
      .mockRejectedValueOnce(new Error("Not found"));

    await main(DEFAULT_CONTEXT);

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.warning).not.toHaveBeenCalled();
    expect(svgo.SVGOptimizer).toHaveBeenCalledWith(2, undefined);
  });

  test.each([
    [2, "svgo-configuration.js"],
    [1, "svgo-configuration.yml"],
  ])("a custom SVGO config file does not exist (%s, %s)", async (version, filePath) => {
    core.warning.mockClear();
    core.setFailed.mockClear();
    svgo.SVGOptimizer.mockClear();

    inputs.ActionConfig.mockImplementationOnce(() => {
      return { svgoOptionsPath: filePath, svgoVersion: version };
    });

    when(fs.readFile)
      .calledWith(filePath)
      .mockRejectedValueOnce(new Error("Not found"));

    await main(DEFAULT_CONTEXT);

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringMatching("SVGO config file '.*' not found"),
    );
    expect(svgo.SVGOptimizer).toHaveBeenCalledWith(version, undefined);
  });

  test.each([
    [2, "svgo.config.js"],
    [1, ".svgo.yml"],
  ])("use a SVGO config file that is invalid (%s, %s)", async (version, filePath) => {
    core.warning.mockClear();
    core.setFailed.mockClear();
    svgo.SVGOptimizer.mockClear();

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

    await main(DEFAULT_CONTEXT);

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringMatching("SVGO config file '.*' invalid"),
    );
    expect(svgo.SVGOptimizer).toHaveBeenCalledWith(version, undefined);
  });
});
