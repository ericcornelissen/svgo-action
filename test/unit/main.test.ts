import { mocked } from "ts-jest/utils";

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

import * as _core from "@actions/core";
import * as _github from "@actions/github";

import _actionManagement from "../../src/action-management";
import _clients from "../../src/clients";
import _errors from "../../src/errors";
import _fileSystems from "../../src/file-systems";
import * as _helpers from "../../src/helpers";
import _inputs from "../../src/inputs";
import _optimize from "../../src/optimize";
import _outputs from "../../src/outputs";
import _svgo from "../../src/svgo";

const core = mocked(_core);
const github = mocked(_github);
const actionManagement = mocked(_actionManagement);
const clients = mocked(_clients);
const inputs = mocked(_inputs);
const errors = mocked(_errors);
const fileSystems = mocked(_fileSystems);
const helpers = mocked(_helpers);
const optimize = mocked(_optimize);
const outputs = mocked(_outputs);
const svgo = mocked(_svgo);

import main from "../../src/main";

describe("main.ts", () => {
  let action;

  beforeAll(() => {
    const [config] = inputs.New({ inp: core });
    action = actionManagement.New({ core, config });
  });

  beforeEach(() => {
    core.info.mockClear();

    const actionManagerMock = mocked(action);
    actionManagerMock.failIf.mockClear();
    actionManagerMock.strictFailIf.mockClear();

    actionManagement.New.mockClear();
    clients.New.mockClear();
    fileSystems.New.mockClear();
    helpers.deprecationWarnings.mockClear();
    helpers.getFilters.mockClear();
    helpers.isEventSupported.mockClear();
    helpers.parseRawSvgoConfig.mockClear();
    inputs.New.mockClear();
    optimize.Files.mockClear();
    outputs.Set.mockClear();
    svgo.New.mockClear();
  });

  test("call process in successful run", async () => {
    await main({ core, github });

    expect(core.setFailed).not.toHaveBeenCalled();

    expect(actionManagement.New).toHaveBeenCalledTimes(1);
    expect(clients.New).toHaveBeenCalledTimes(1);
    expect(fileSystems.New).toHaveBeenCalledTimes(2);
    expect(helpers.deprecationWarnings).toHaveBeenCalledTimes(1);
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
      helpers.isEventSupported.mockReturnValueOnce([eventName, true]);

      await main({ core, github });

      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`'${eventName}'`),
      );
    });
  });

  describe("Dry mode", () => {
    const expectedMsg = expect.stringContaining("Dry mode enabled");

    function doMockDryMode(value: boolean): void {
      const [baseConfig] = inputs.New({ inp: core });
      const config = Object.assign(baseConfig, { isDryRun: { value } });
      inputs.New.mockReturnValueOnce([config, null]);
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
    inputs.New.mockReturnValueOnce([config, err]);

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
    helpers.isEventSupported.mockReturnValueOnce([eventName, false]);

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
      helpers.isClientRequired.mockReturnValue(clientRequired);

      const [client] = clients.New({ github, inp: core });
      clients.New.mockReturnValueOnce([client, null]);

      await main({ core, github });

      expect(action.failIf).toHaveBeenCalledWith(null, failureMessage);
    });

    test.each([
      true,
      false,
    ])("an error (client required=%s)", async (clientRequired) => {
      helpers.isClientRequired.mockReturnValue(clientRequired);

      const [client] = clients.New({ github, inp: core });

      const err = errors.New("GitHub client error");
      clients.New.mockReturnValueOnce([client, err]);

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

        inputs.New.mockReturnValueOnce([config, null]);

        await main({ core, github });

        expect(action.strictFailIf).toHaveBeenCalledWith(false, failureMessage);
      });

      test("an error, without path configured", async () => {
        const [baseConfig] = inputs.New({ inp: core });
        const config = Object.assign(baseConfig, {
          svgoConfigPath: { provided: false },
        });

        inputs.New.mockReturnValueOnce([config, null]);

        const err = errors.New("read file error");
        fileSystems.New.mockReturnValueOnce({
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

        inputs.New.mockReturnValueOnce([config, null]);

        const err = errors.New("read file error");
        fileSystems.New.mockReturnValueOnce({
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
        fileSystems.New.mockReturnValueOnce({
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

        fileSystems.New.mockReturnValueOnce({
          listFiles: jest.fn(),
          readFile: jest.fn()
            .mockResolvedValueOnce(["", null])
            .mockName("fs.readFile"),
          writeFile: jest.fn(),
        });
        helpers.parseRawSvgoConfig.mockReturnValueOnce([{ }, err]);

        await main({ core, github });

        expect(action.strictFailIf).toHaveBeenCalledWith(true, failureMessage);
      });

      test("an error and read error", async () => {
        const [baseConfig] = inputs.New({ inp: core });
        const config = Object.assign(baseConfig, {
          isStrictMode: { value: false },
        });

        inputs.New.mockReturnValueOnce([config, null]);

        const parseErr = errors.New("parse file error");
        const readErr = errors.New("read file error");

        fileSystems.New.mockReturnValueOnce({
          listFiles: jest.fn(),
          readFile: jest.fn()
            .mockResolvedValueOnce(["", readErr])
            .mockName("fs.readFile"),
          writeFile: jest.fn(),
        });
        helpers.parseRawSvgoConfig.mockReturnValueOnce([{ }, parseErr]);

        await main({ core, github });

        expect(action.strictFailIf).toHaveBeenCalledWith(false, failureMessage);
      });
    });
  });

  test("svgo error", async () => {
    const [config] = inputs.New({ inp: core });
    const action = actionManagement.New({ core, config });
    const [optimizer] = svgo.New({ config });

    const err = errors.New("SVGO error");
    svgo.New.mockReturnValueOnce([optimizer, err]);

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
    helpers.getFilters.mockResolvedValueOnce([[], err]);

    await main({ core, github });

    expect(action.failIf).toHaveBeenCalledWith(
      err,
      expect.stringContaining("filters"),
    );
  });

  test("optimize error", async () => {
    const [config] = inputs.New({ inp: core });
    const action = actionManagement.New({ core, config });
    const fs = fileSystems.New({ filters: [] });
    const [optimizer] = svgo.New({ config });
    const [data] = await optimize.Files({ config, fs, optimizer });

    const err = errors.New("Optimization error");
    optimize.Files.mockResolvedValueOnce([data, err]);

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
    outputs.Set.mockReturnValueOnce(err);

    await main({ core, github });

    expect(action.failIf).toHaveBeenCalledWith(
      err,
      expect.stringContaining("output"),
    );
  });
});
