import type { SupportedSvgoVersions } from "../../src/svgo";
import type { Octokit } from "../../src/types";

import { mocked } from "ts-jest/utils";

import inp from "../__common__/inputter.mock";

jest.dontMock("js-yaml");
jest.dontMock("minimatch");
jest.dontMock("node-eval");

jest.mock("@actions/core");
jest.mock("@actions/github");

import * as core from "@actions/core";
import * as _github from "@actions/github";

const github = mocked(_github);

import clients from "../../src/clients";
import {
  deprecationWarnings,
  getFilters,
  isClientRequired,
  isEventSupported,
  parseRawSvgoConfig,
} from "../../src/helpers";

describe("package helpers", () => {
  const EVENT_PULL_REQUEST = "pull_request";
  const EVENT_PUSH = "push";
  const EVENT_REPOSITORY_DISPATCH = "repository_dispatch";
  const EVENT_SCHEDULE = "schedule";
  const EVENT_WORKFLOW_DISPATCH = "workflow_dispatch";

  describe("::deprecationWarnings", () => {
    test.each([
      "1",
      "2",
      "project",
    ])("does not fail (%s)", (svgoVersion) => {
      const config = {
        svgoVersion: {
          value: svgoVersion as SupportedSvgoVersions,
        },
      };

      expect(() => deprecationWarnings({ config, core })).not.toThrow();
    });
  });

  describe("::getFilters", () => {
    let client;
    let config;

    const fileSvg = "foobar.svg";
    const fileNotSvg = "foo.bar";
    const fileSvgInFolderFoo = "foo/bar.svg";
    const svgNotInContext = "old_file.svg";

    const STATUS_ADDED = "added";

    beforeAll(() => {
      const filesAlwaysInContext = [
        fileSvg,
        fileNotSvg,
        fileSvgInFolderFoo,
      ].map((filename) => ({ filename, status: STATUS_ADDED }));
      github.getOctokit.mockReturnValueOnce({
        rest: {
          repos: {
            getCommit: jest.fn()
              .mockReturnValue({
                data: {
                  files: [
                    ...filesAlwaysInContext,
                  ],
                },
              }),
          },
          pulls: {
            listFiles: jest.fn()
              .mockReturnValue({
                data: [
                  ...filesAlwaysInContext,
                ],
              }),
          },
        },
      } as unknown as Octokit);

      [client] = clients.New({ github, inp });
    });

    beforeEach(() => {
      config = {
        ignoreGlobs:{
          value: [],
        },
      };
    });

    test.each([
      EVENT_PULL_REQUEST,
      EVENT_PUSH,
      EVENT_REPOSITORY_DISPATCH,
      EVENT_SCHEDULE,
      EVENT_WORKFLOW_DISPATCH,
    ])("does not filter out SVG in context ('%s')", async (eventName) => {
      github.context.eventName = eventName;

      const [filters, err] = await getFilters({ client, config, github });
      expect(err).toBeNull();

      const result = filters.every((filter) => filter(fileSvg));
      expect(result).toBe(true);
    });

    test.each([
      EVENT_PULL_REQUEST,
      EVENT_PUSH,
      EVENT_REPOSITORY_DISPATCH,
      EVENT_SCHEDULE,
      EVENT_WORKFLOW_DISPATCH,
    ])("filters out non-svgs ('%s')", async (eventName) => {
      github.context.eventName = eventName;

      const [filters, err] = await getFilters({ client, config, github });
      expect(err).toBeNull();

      const result = filters.every((f) => f(fileNotSvg));
      expect(result).toBe(false);
    });

    test.each([
      EVENT_PULL_REQUEST,
      EVENT_PUSH,
      EVENT_REPOSITORY_DISPATCH,
      EVENT_SCHEDULE,
      EVENT_WORKFLOW_DISPATCH,
    ])("filters out ignored files ('%s')", async (eventName) => {
      github.context.eventName = eventName;
      config.ignoreGlobs.value = ["foo/*"];

      const [filters, err] = await getFilters({ client, config, github });
      expect(err).toBeNull();

      const result = filters.every((f) => f(fileSvgInFolderFoo));
      expect(result).toBe(false);
    });

    test.each([
      EVENT_PULL_REQUEST,
      EVENT_PUSH,
    ])("filters out SVGs not in context ('%s')", async (eventName) => {
      github.context.eventName = eventName;

      const [filters, err] = await getFilters({ client, config, github });
      expect(err).toBeNull();

      const result = filters.every((filter) => filter(svgNotInContext));
      expect(result).toBe(false);
    });
  });

  describe("::isClientRequired", () => {
    test("returns not null", () => {
      const result = isClientRequired(EVENT_PUSH);
      expect(result).not.toBeNull();
    });
  });

  describe("::isEventSupported", () => {
    test("returns not null", () => {
      const params = {
        context: {
          eventName: EVENT_PUSH,
        },
      };

        const [eventName, ok] = isEventSupported(params);
      expect(eventName).not.toBeNull();
      expect(ok).not.toBeNull();
    });
  });

  describe("::parseRawSvgoConfig", () => {
    describe("YAML configuration file", () => {
      const config = {
        svgoConfigPath: { value: ".svgo.yml" },
      };

      test("valid configuration", () => {
        const rawConfig = "multipass: true";

        const [svgoConfig, err] = parseRawSvgoConfig({ config, rawConfig });
        expect(err).toBeNull();
        expect(svgoConfig).not.toBeNull();
      });

      test("invalid configuration", () => {
        const rawConfig = "-\nthis isn't valid YAML";

        const [, err] = parseRawSvgoConfig({ config, rawConfig });
        expect(err).not.toBeNull();
      });
    });

    describe("JavaScript configuration", () => {
      const config = {
        svgoConfigPath: { value: "svgo.config.js" },
      };

      test("valid configuration", () => {
        const rawConfig = "module.exports = { multipass: true };";

        const [svgoConfig, err] = parseRawSvgoConfig({ config, rawConfig });
        expect(err).toBeNull();
        expect(svgoConfig).not.toBeNull();
      });

      test("invalid configuration", () => {
        const rawConfig = "this isn't valid JavaScript";

        const [, err] = parseRawSvgoConfig({ config, rawConfig });
        expect(err).not.toBeNull();
      });
    });
  });
});
