import type { Core, GitHub } from "../../src/types";

import { createGitHubMock } from "../__mocks__/@actions/github.mock";
import { createCoreMock } from "../__mocks__/@actions/core.mock";
import clientsMock, { _sampleClient }  from "../__mocks__/clients.mock";
import configsMock, { _sampleConfig } from "../__mocks__/configs.mock";
import fileSystemsMock, { _sampleFs } from "../__mocks__/file-systems.mock";
import filtersMock from "../__mocks__/filters.mock";
import optimizeMock, { _sampleData } from "../__mocks__/optimize.mock";
import outputsMock from "../__mocks__/outputs.mock";
import parsersMock from "../__mocks__/parsers.mock";
import svgoMock, { _sampleSvgo } from "../__mocks__/svgo.mock";

jest.mock("../../src/clients", () => clientsMock);
jest.mock("../../src/configs", () => configsMock);
jest.mock("../../src/file-systems", () => fileSystemsMock);
jest.mock("../../src/filters", () => filtersMock);
jest.mock("../../src/optimize", () => optimizeMock);
jest.mock("../../src/outputs", () => outputsMock);
jest.mock("../../src/parsers", () => parsersMock);
jest.mock("../../src/svgo", () => svgoMock);

const isEventSupported: jest.Mock<[string, boolean], []> = jest.fn()
  .mockReturnValue(["push", true]);

const helpers = {
  isEventSupported,
};

jest.mock("../../src/helpers", () => helpers);

import errors from "../../src/errors";
import main from "../../src/main";

describe("main.ts", () => {
  let core: Core;
  let github: GitHub;

  beforeEach(() => {
    core = createCoreMock();
    github = createGitHubMock();

    clientsMock.New.mockClear();
    configsMock.New.mockClear();
    fileSystemsMock.New.mockClear();
    fileSystemsMock.NewFiltered.mockClear();
    filtersMock.NewPrFilesFilter.mockClear();
    filtersMock.NewPushedFilesFilter.mockClear();
    filtersMock.NewSvgsFilter.mockClear();
    optimizeMock.optimizeSvgs.mockClear();
    outputsMock.setOutputValues.mockClear();
    parsersMock.NewJavaScript.mockClear();
    parsersMock.NewYaml.mockClear();
    svgoMock.New.mockClear();

    helpers.isEventSupported.mockClear();
  });

  describe("Successful run", () => {
    test("call process (defaults)", async () => {
      await main({ core, github });

      expect(core.setFailed).not.toHaveBeenCalled();

      expect(clientsMock.New).toHaveBeenCalledTimes(1);
      expect(configsMock.New).toHaveBeenCalledTimes(1);
      expect(fileSystemsMock.New).toHaveBeenCalledTimes(1);
      expect(fileSystemsMock.NewFiltered).toHaveBeenCalledTimes(1);
      expect(filtersMock.NewSvgsFilter).toHaveBeenCalledTimes(1);
      expect(optimizeMock.optimizeSvgs).toHaveBeenCalledTimes(1);
      expect(outputsMock.setOutputValues).toHaveBeenCalledTimes(1);
      expect(parsersMock.NewJavaScript).toHaveBeenCalledTimes(1);
      expect(svgoMock.New).toHaveBeenCalledTimes(1);

      expect(helpers.isEventSupported).toHaveBeenCalledTimes(1);
    });

    test.each([
      "push",
      "pull_request",
      "repository_dispatch",
      "schedule",
      "workflow_dispatch",
    ])("logs events ('%s')", async (eventName) => {
      helpers.isEventSupported.mockReturnValueOnce([eventName, true]);

      await main({ core, github });

      expect(core.info).toHaveBeenCalledWith(
        expect.stringContaining(`'${eventName}'`),
      );
    });

    describe("Dry mode", () => {
      const expectedMsg = expect.stringContaining("Dry mode enabled");

      function doMockDryMode(isDryRun: boolean): void {
        const config = Object.assign(_sampleConfig, { isDryRun });
        configsMock.New.mockReturnValueOnce([config, null]);
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

    describe("SVGO version", () => {
      function doMockSvgoVersion(svgoVersion: 1 | 2): void {
        const config = Object.assign(_sampleConfig, { svgoVersion });
        configsMock.New.mockReturnValueOnce([config, null]);
      }

      test("v1", async () => {
        doMockSvgoVersion(1);

        await main({ core, github });

        expect(parsersMock.NewYaml).toHaveBeenCalledTimes(1);
        expect(parsersMock.NewJavaScript).not.toHaveBeenCalled();
      });

      test("v2", async () => {
        doMockSvgoVersion(2);

        await main({ core, github });

        expect(parsersMock.NewJavaScript).toHaveBeenCalledTimes(1);
        expect(parsersMock.NewYaml).not.toHaveBeenCalled();
      });
    });
  });

  describe("Failed run", () => {
    test("config error", async () => {
      const errMsg = "No configuration found";
      const err = errors.New(errMsg);
      configsMock.New.mockReturnValueOnce([_sampleConfig, err]);

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

    test("client error", async () => {
      const err = errors.New("GitHub client error");
      clientsMock.New.mockReturnValueOnce([_sampleClient, err]);

      await main({ core, github });

      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining("GitHub client"),
      );

      expect(core.debug).toHaveBeenCalledWith(err);
    });

    test("svgo configuration file read error", async () => {
      const err = errors.New("read file error");
      fileSystemsMock.New.mockReturnValueOnce({
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

    test("svgo options parse error, no read error (svgo v1)", async () => {
      const config = Object.assign(_sampleConfig, { svgoVersion: 1 });
      configsMock.New.mockReturnValueOnce([config, null]);

      const err = errors.New("read file error");
      const erroringParser = jest.fn().mockReturnValue([{}, err]);
      parsersMock.NewYaml.mockReturnValueOnce(erroringParser);

      await main({ core, github });

      expect(core.setFailed).toHaveBeenCalledTimes(1);
    });

    test("svgo options parse error, no read error (svgo v2)", async () => {
      const config = Object.assign(_sampleConfig, { svgoVersion: 2 });
      configsMock.New.mockReturnValueOnce([config, null]);

      const err = errors.New("read file error");
      const erroringParser = jest.fn().mockReturnValue([{}, err]);
      parsersMock.NewJavaScript.mockReturnValueOnce(erroringParser);

      await main({ core, github });

      expect(core.setFailed).toHaveBeenCalledTimes(1);
    });

    test("svgo creation error", async () => {
      const err = errors.New("SVGO error");
      svgoMock.New.mockReturnValueOnce([_sampleSvgo, err]);

      await main({ core, github });

      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining("SVGO"),
      );
    });

    test("filters error (event: \"push\")", async () => {
      isEventSupported.mockReturnValueOnce(["push", true]);

      const err = errors.New("create filter error");
      filtersMock.NewPushedFilesFilter.mockReturnValueOnce([() => false, err]);

      await main({ core, github });

      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining("filters"),
      );

      expect(core.debug).toHaveBeenCalledWith(err);
    });

    test("filters error (event: \"pull_request\")", async () => {
      isEventSupported.mockReturnValueOnce(["pull_request", true]);

      const err = errors.New("create filter error");
      filtersMock.NewPrFilesFilter.mockReturnValueOnce([() => false, err]);

      await main({ core, github });

      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining("filters"),
      );

      expect(core.debug).toHaveBeenCalledWith(err);
    });

    test("file system error", async () => {
      const err = errors.New("File system error");
      fileSystemsMock.NewFiltered.mockReturnValueOnce([_sampleFs, err]);

      await main({ core, github });

      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining("file system"),
      );

      expect(core.debug).toHaveBeenCalledWith(err);
    });

    test("optimize error", async () => {
      const err = errors.New("Optimization error");
      optimizeMock.optimizeSvgs.mockResolvedValueOnce([_sampleData, err]);

      await main({ core, github });

      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining("optimize"),
      );

      expect(core.debug).toHaveBeenCalledWith(err);
    });

    test("outputs error", async () => {
      const err = errors.New("Output error");
      outputsMock.setOutputValues.mockReturnValueOnce(err);

      await main({ core, github });

      expect(core.setFailed).toHaveBeenCalledTimes(1);
      expect(core.setFailed).toHaveBeenCalledWith(
        expect.stringContaining("output"),
      );

      expect(core.debug).toHaveBeenCalledWith(err);
    });
  });
});
