import { mocked } from "ts-jest/utils";

jest.mock("@actions/core");
jest.mock("@actions/github");
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

import _clients from "../../src/clients";
import _errors from "../../src/errors";
import _fileSystems from "../../src/file-systems";
import * as _helpers from "../../src/helpers";
import _inputs from "../../src/inputs";
import _optimize from "../../src/optimize";
import * as _outputs from "../../src/outputs";
import _svgo from "../../src/svgo";

const core = mocked(_core);
const github = mocked(_github);
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
  beforeEach(() => {
    core.info.mockClear();
    core.setFailed.mockClear();
    core.warning.mockClear();

    clients.New.mockClear();
    fileSystems.New.mockClear();
    helpers.getFilters.mockClear();
    helpers.isEventSupported.mockClear();
    helpers.parseRawSvgoConfig.mockClear();
    inputs.New.mockClear();
    optimize.Files.mockClear();
    outputs.setOutputValues.mockClear();
    svgo.New.mockClear();
  });

  test("call process (defaults)", async () => {
    await main({ core, github });

    expect(core.setFailed).not.toHaveBeenCalled();

    expect(clients.New).toHaveBeenCalledTimes(1);
    expect(fileSystems.New).toHaveBeenCalledTimes(2);
    expect(helpers.getFilters).toHaveBeenCalledTimes(1);
    expect(helpers.isEventSupported).toHaveBeenCalledTimes(1);
    expect(helpers.parseRawSvgoConfig).toHaveBeenCalledTimes(1);
    expect(inputs.New).toHaveBeenCalledTimes(1);
    expect(optimize.Files).toHaveBeenCalledTimes(1);
    expect(outputs.setOutputValues).toHaveBeenCalledTimes(1);
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
    ])("events ('%s')", async (eventName) => {
      helpers.isEventSupported.mockReturnValueOnce([eventName, true]);

      await main({ core, github });

      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`'${eventName}'`),
      );
    });

    test.each([
      1,
      2,
    ])("SVGO (major) version (`%s`)", async (_svgoVersion) => {
      const svgoVersion = _svgoVersion as 1 | 2;

      const [baseConfig] = inputs.New({ inp: core });
      const config = Object.assign({ }, baseConfig, { svgoVersion });
      inputs.New.mockReturnValueOnce([config, null]);

      await main({ core, github });

      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`version ${svgoVersion}`),
      );
    });
  });

  describe("Dry mode", () => {
    const expectedMsg = expect.stringContaining("Dry mode enabled");

    function doMockDryMode(isDryRun: boolean): void {
      const [baseConfig] = inputs.New({ inp: core });
      const config = Object.assign(baseConfig, { isDryRun });
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

  test("config error", async () => {
    const [baseConfig] = inputs.New({ inp: core });

    const errMsg = "No configuration found";
    const err = errors.New(errMsg);
    inputs.New.mockReturnValueOnce([baseConfig, err]);

    await main({ core, github });

    expect(core.setFailed).not.toHaveBeenCalled();
    expect(core.warning).toHaveBeenCalledWith(
      expect.stringContaining(errMsg),
    );
  });

  test("event error", async () => {
    const eventName = "unknown";
    helpers.isEventSupported.mockReturnValueOnce([eventName, false]);

    await main({ core, github });

    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining(`'${eventName}'`),
    );
  });

  test("client error, client not required", async () => {
    helpers.isClientRequired.mockReturnValue(false);

    const [client] = clients.New({ github, inp: core });

    const err = errors.New("GitHub client error");
    clients.New.mockReturnValueOnce([client, err]);

    await main({ core, github });

    expect(core.setFailed).not.toHaveBeenCalled();
  });

  test("client error, client required (%s)", async () => {
    helpers.isClientRequired.mockReturnValue(true);

    const [client] = clients.New({ github, inp: core });

    const err = errors.New("GitHub client error");
    clients.New.mockReturnValueOnce([client, err]);

    await main({ core, github });

    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("GitHub client"),
    );

    expect(core.debug).toHaveBeenCalledWith(err);
  });

  describe("svgo configuration", () => {
    test("read error only", async () => {
      const err = errors.New("read file error");
      fileSystems.New.mockReturnValueOnce({
        listFiles: jest.fn(),
        readFile: jest.fn()
          .mockResolvedValueOnce(["", err])
          .mockName("fs.readFile"),
        writeFile: jest.fn(),
      });

      await main({ core, github });

      expect(core.setFailed).not.toHaveBeenCalledWith();
      expect(core.warning).toHaveBeenCalledWith(
        expect.stringContaining("configuration file"),
      );
    });

    test("parse error only", async () => {
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

      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining("SVGO configuration"),
      );
    });

    test("read error & parse error", async () => {
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

      expect(core.setFailed).not.toHaveBeenCalled();
    });
  });

  test("svgo creation error", async () => {
    const [config] = inputs.New({ inp: core });
    const [optimizer] = svgo.New({ config });

    const err = errors.New("SVGO error");
    svgo.New.mockReturnValueOnce([optimizer, err]);

    await main({ core, github });

    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("SVGO"),
    );
  });

  test("filters error (event: \"push\")", async () => {
    const err = errors.New("create filter error");
    helpers.getFilters.mockResolvedValueOnce([[], err]);

    await main({ core, github });

    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("filters"),
    );

    expect(core.debug).toHaveBeenCalledWith(err);
  });

  test("optimize error", async () => {
    const [config] = inputs.New({ inp: core });
    const fs = fileSystems.New({ filters: [] });
    const [optimizer] = svgo.New({ config });
    const [data] = await optimize.Files({ config, fs, optimizer });

    const err = errors.New("Optimization error");
    optimize.Files.mockResolvedValueOnce([data, err]);

    await main({ core, github });

    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("optimize"),
    );

    expect(core.debug).toHaveBeenCalledWith(err);
  });

  test("outputs error", async () => {
    const err = errors.New("Output error");
    outputs.setOutputValues.mockReturnValueOnce(err);

    await main({ core, github });

    expect(core.setFailed).toHaveBeenCalledTimes(1);
    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining("output"),
    );

    expect(core.debug).toHaveBeenCalledWith(err);
  });
});
