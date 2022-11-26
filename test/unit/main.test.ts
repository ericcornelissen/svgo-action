jest.mock("@actions/core");
jest.mock("@actions/github");
jest.mock("../../src/action-management");
jest.mock("../../src/clients");
jest.mock("../../src/errors");
jest.mock("../../src/file-systems");
jest.mock("../../src/helpers");
jest.mock("../../src/inputs");
jest.mock("../../src/optimize");
jest.mock("../../src/outputs");
jest.mock("../../src/svgo");

import * as core from "@actions/core";
import * as github from "@actions/github";

import actionManagement from "../../src/action-management";
import clients from "../../src/clients";
import errors from "../../src/errors";
import fileSystems from "../../src/file-systems";
import * as helpers from "../../src/helpers";
import inputs from "../../src/inputs";
import main from "../../src/main";
import optimize from "../../src/optimize";
import outputs from "../../src/outputs";
import svgo from "../../src/svgo";

const actionManagementNew = actionManagement.New as jest.MockedFunction<typeof actionManagement.New>; // eslint-disable-line max-len
const clientsNew = clients.New as jest.MockedFunction<typeof clients.New>;
const coreInfo = core.info as jest.MockedFunction<typeof core.info>;
const fileSystemsNew = fileSystems.New as jest.MockedFunction<typeof fileSystems.New>; // eslint-disable-line max-len
const helpersIsClientRequired = helpers.isClientRequired as jest.MockedFunction<typeof helpers.isClientRequired>; // eslint-disable-line max-len
const helpersIsEventSupported = helpers.isEventSupported as jest.MockedFunction<typeof helpers.isEventSupported>; // eslint-disable-line max-len
const helpersGetFilters = helpers.getFilters as jest.MockedFunction<typeof helpers.getFilters>; // eslint-disable-line max-len
const helpersParseRawSvgoConfig = helpers.parseRawSvgoConfig as jest.MockedFunction<typeof helpers.parseRawSvgoConfig>; // eslint-disable-line max-len
const inputsNew = inputs.New as jest.MockedFunction<typeof inputs.New>;
const optimizeFiles = optimize.Files as jest.MockedFunction<typeof optimize.Files>; // eslint-disable-line max-len
const outputsSet = outputs.Set as jest.MockedFunction<typeof outputs.Set>;
const svgoNew = svgo.New as jest.MockedFunction<typeof svgo.New>;

describe("main.ts", () => {
  let action;

  beforeAll(() => {
    const [config] = inputs.New({ inp: core });
    action = actionManagement.New({ core, config });
  });

  beforeEach(() => {
    const actionManagerFailIf = action.failIf as jest.MockedFunction<typeof action.failIf>; // eslint-disable-line max-len
    const actionManagerStrictFailIf = action.strictFailIf as jest.MockedFunction<typeof action.strictFailIf>; // eslint-disable-line max-len
    actionManagerFailIf.mockClear();
    actionManagerStrictFailIf.mockClear();

    actionManagementNew.mockClear();
    coreInfo.mockClear();
    clientsNew.mockClear();
    fileSystemsNew.mockClear();
    helpersGetFilters.mockClear();
    helpersIsEventSupported.mockClear();
    helpersParseRawSvgoConfig.mockClear();
    inputsNew.mockClear();
    optimizeFiles.mockClear();
    outputsSet.mockClear();
    svgoNew.mockClear();
  });

  test("call process in successful run", async () => {
    await main({ core, github });

    expect(core.setFailed).not.toHaveBeenCalled();

    expect(actionManagement.New).toHaveBeenCalledTimes(1);
    expect(clients.New).toHaveBeenCalledTimes(1);
    expect(fileSystems.New).toHaveBeenCalledTimes(2);
    expect(helpers.getFilters).toHaveBeenCalledTimes(1);
    expect(helpers.isEventSupported).toHaveBeenCalledTimes(1);
    expect(helpers.parseRawSvgoConfig).toHaveBeenCalledTimes(1);
    expect(inputs.New).toHaveBeenCalledTimes(1);
    expect(optimize.Files).toHaveBeenCalledTimes(1);
    expect(outputs.Set).toHaveBeenCalledTimes(1);
    expect(svgo.New).toHaveBeenCalledTimes(1);

    expect(core.warning).not.toHaveBeenCalled();
  });

  describe("logs", () => {
    test.each([
      "push",
      "pull_request",
      "repository_dispatch",
      "schedule",
      "workflow_dispatch",
    ])("the event ('%s')", async (eventName) => {
      helpersIsEventSupported.mockReturnValueOnce([eventName, true]);

      await main({ core, github });

      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`'${eventName}'`),
      );
    });

    test("the debug logs", async () => {
      await main({ core, github });

      expect(core.debug).toHaveBeenCalledWith(
        "Getting input",
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Initializing ActionManagement",
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Checking if dry-run is enabled",
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Checking if the event is supported",
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Initializing GitHub client",
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Initializing FileSystem to read SVGO config",
      );
      expect(core.debug).toHaveBeenCalledWith(
        expect.stringMatching("Reading the SVGO config file at .*"),
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Parsing SVGO configuration",
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Initializing SVGO",
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Initializing optimization filters",
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Initializing FileSystem to read SVGs",
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Optimizing SVGs",
      );
      expect(core.debug).toHaveBeenCalledWith(
        "Setting outputs",
      );
    });
  });

  describe("Dry mode", () => {
    const expectedMsg = expect.stringContaining("Dry mode enabled");

    function doMockDryMode(value: boolean): void {
      const [baseConfig] = inputs.New({ inp: core });
      const config = Object.assign(baseConfig, { isDryRun: { value } });
      inputsNew.mockReturnValueOnce([config, null]);
    }

    test("enabled", async () => {
      doMockDryMode(true);

      await main({ core, github });

      expect(core.info).toHaveBeenCalledWith(expectedMsg);
    });

    test("disabled", async () => {
      doMockDryMode(false);

      await main({ core, github });

      expect(core.info).not.toHaveBeenCalledWith(expectedMsg);
    });
  });

  test("inputs error", async () => {
    const [baseConfig] = inputs.New({ inp: core });
    const config = Object.assign(baseConfig, {
      isStrictMode: { value: false },
    });

    const action = actionManagement.New({ core, config });

    const errMsg = "No configuration found";
    const err = errors.New(errMsg);
    inputsNew.mockReturnValueOnce([config, err]);

    await main({ core, github });

    expect(action.strictFailIf).toHaveBeenCalledWith(
      err,
      expect.stringContaining(errMsg),
    );
  });

  test("event error", async () => {
    const [config] = inputs.New({ inp: core });
    const action = actionManagement.New({ core, config });

    const eventName = "unknown";
    helpersIsEventSupported.mockReturnValueOnce([eventName, false]);

    await main({ core, github });

    expect(action.strictFailIf).toHaveBeenCalledWith(
      true,
      expect.stringContaining(`'${eventName}'`),
    );
  });

  describe("GitHub client", () => {
    const failureMessage = "Could not get GitHub client";

    test.each([
      true,
      false,
    ])("no error (client required=%s)", async (clientRequired) => {
      helpersIsClientRequired.mockReturnValue(clientRequired);

      const [client] = clients.New({ github, inp: core });
      clientsNew.mockReturnValueOnce([client, null]);

      await main({ core, github });

      expect(action.failIf).toHaveBeenCalledWith(null, failureMessage);
    });

    test.each([
      true,
      false,
    ])("an error (client required=%s)", async (clientRequired) => {
      helpersIsClientRequired.mockReturnValue(clientRequired);

      const [client] = clients.New({ github, inp: core });

      const err = errors.New("GitHub client error");
      clientsNew.mockReturnValueOnce([client, err]);

      await main({ core, github });

      expect(action.failIf).toHaveBeenCalledWith(
        clientRequired,
        failureMessage,
      );
    });
  });

  describe("SVGO configuration", () => {
    describe("reading", () => {
      const failureMessage = "SVGO configuration file not found";

      test.each([
        true,
        false,
      ])("no error (path configured=%s)", async (pathConfigured) => {
        const [baseConfig] = inputs.New({ inp: core });
        const config = Object.assign(baseConfig, {
          svgoConfigPath: { provided: pathConfigured },
        });

        inputsNew.mockReturnValueOnce([config, null]);

        await main({ core, github });

        expect(action.strictFailIf).toHaveBeenCalledWith(false, failureMessage);
      });

      test("an error, without path configured", async () => {
        const [baseConfig] = inputs.New({ inp: core });
        const config = Object.assign(baseConfig, {
          svgoConfigPath: { provided: false },
        });

        inputsNew.mockReturnValueOnce([config, null]);

        const err = errors.New("read file error");
        fileSystemsNew.mockReturnValueOnce({
          listFiles: jest.fn(),
          readFile: jest.fn()
            .mockResolvedValueOnce(["", err])
            .mockName("fs.readFile"),
          writeFile: jest.fn(),
        });

        await main({ core, github });

        expect(action.strictFailIf).toHaveBeenCalledWith(false, failureMessage);
      });

      test("an error, with path configured", async () => {
        const [baseConfig] = inputs.New({ inp: core });
        const config = Object.assign(baseConfig, {
          svgoConfigPath: { provided: true },
          isStrictMode: { value: false },
        });

        inputsNew.mockReturnValueOnce([config, null]);

        const err = errors.New("read file error");
        fileSystemsNew.mockReturnValueOnce({
          listFiles: jest.fn(),
          readFile: jest.fn()
            .mockResolvedValueOnce(["", err])
            .mockName("fs.readFile"),
          writeFile: jest.fn(),
        });

        await main({ core, github });

        expect(action.strictFailIf).toHaveBeenCalledWith(true, failureMessage);
      });
    });

    describe("parsing", () => {
      const failureMessage = "Could not parse SVGO configuration";

      test.each([
        null,
        errors.New("read file error"),
      ])("no error (read error=`%s`)", async (err) => {
        fileSystemsNew.mockReturnValueOnce({
          listFiles: jest.fn(),
          readFile: jest.fn()
            .mockResolvedValueOnce(["", err])
            .mockName("fs.readFile"),
          writeFile: jest.fn(),
        });
        await main({ core, github });

        expect(action.strictFailIf).toHaveBeenCalledWith(false, failureMessage);
      });

      test("an error but without read error", async () => {
        const err = errors.New("parse file error");

        fileSystemsNew.mockReturnValueOnce({
          listFiles: jest.fn(),
          readFile: jest.fn()
            .mockResolvedValueOnce(["", null])
            .mockName("fs.readFile"),
          writeFile: jest.fn(),
        });
        helpersParseRawSvgoConfig.mockReturnValueOnce([{ }, err]);

        await main({ core, github });

        expect(action.strictFailIf).toHaveBeenCalledWith(true, failureMessage);
      });

      test("an error and read error", async () => {
        const [baseConfig] = inputs.New({ inp: core });
        const config = Object.assign(baseConfig, {
          isStrictMode: { value: false },
        });

        inputsNew.mockReturnValueOnce([config, null]);

        const parseErr = errors.New("parse file error");
        const readErr = errors.New("read file error");

        fileSystemsNew.mockReturnValueOnce({
          listFiles: jest.fn(),
          readFile: jest.fn()
            .mockResolvedValueOnce(["", readErr])
            .mockName("fs.readFile"),
          writeFile: jest.fn(),
        });
        helpersParseRawSvgoConfig.mockReturnValueOnce([{ }, parseErr]);

        await main({ core, github });

        expect(action.strictFailIf).toHaveBeenCalledWith(false, failureMessage);
      });
    });
  });

  test("svgo error", async () => {
    const svgoConfig = { };
    const [config] = inputs.New({ inp: core });
    const action = actionManagement.New({ core, config });
    const [optimizer] = svgo.New({ config, log: core, svgoConfig });

    const err = errors.New("SVGO error");
    svgoNew.mockReturnValueOnce([optimizer, err]);

    await main({ core, github });

    expect(action.failIf).toHaveBeenCalledWith(
      err,
      expect.stringContaining("SVGO"),
    );
  });

  test("filters error", async () => {
    const [config] = inputs.New({ inp: core });
    const action = actionManagement.New({ core, config });

    const err = errors.New("create filter error");
    helpersGetFilters.mockResolvedValueOnce([[], err]);

    await main({ core, github });

    expect(action.failIf).toHaveBeenCalledWith(
      err,
      expect.stringContaining("filters"),
    );
  });

  test("optimize error", async () => {
    const svgoConfig = { };
    const [config] = inputs.New({ inp: core });
    const action = actionManagement.New({ core, config });
    const fs = fileSystems.New({ filters: [] });
    const [optimizer] = svgo.New({ config, log: core, svgoConfig });
    const [data] = await optimize.Files({ config, fs, optimizer });

    const err = errors.New("Optimization error");
    optimizeFiles.mockResolvedValueOnce([data, err]);

    await main({ core, github });

    expect(action.failIf).toHaveBeenCalledWith(
      err,
      expect.stringContaining("optimize"),
    );
  });

  test("outputs error", async () => {
    const [config] = inputs.New({ inp: core });
    const action = actionManagement.New({ core, config });

    const err = errors.New("Output error");
    outputsSet.mockReturnValueOnce(err);

    await main({ core, github });

    expect(action.failIf).toHaveBeenCalledWith(
      err,
      expect.stringContaining("output"),
    );
  });
});
