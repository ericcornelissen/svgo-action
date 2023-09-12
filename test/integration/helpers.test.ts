import type { Config } from "../../src/helpers/filters";
import type { Octokit } from "../../src/types";
import type { Mutable } from "../utils";

jest.dontMock("eval");
jest.dontMock("minimatch");

jest.mock("@actions/core");
jest.mock("@actions/github");

import * as github from "@actions/github";

import clients from "../../src/clients";
import {
  getFilters,
  isClientRequired,
  isEventSupported,
  parseRawSvgoConfig,
} from "../../src/helpers";
import inp from "../__common__/inputter.mock";

const githubGetOctokit = github.getOctokit as jest.MockedFunction<typeof github.getOctokit>; // eslint-disable-line max-len

describe("package helpers", () => {
  const EVENT_PULL_REQUEST = "pull_request";
  const EVENT_PUSH = "push";
  const EVENT_REPOSITORY_DISPATCH = "repository_dispatch";
  const EVENT_SCHEDULE = "schedule";
  const EVENT_WORKFLOW_DISPATCH = "workflow_dispatch";

  describe("::getFilters", () => {
    let client: ReturnType<typeof clients.New>[0];
    let config: Mutable<Config>;

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
      githubGetOctokit.mockReturnValueOnce({
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
        ignoreGlobs: {
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

      const result = Array.from(filters).every((filter) => filter(fileSvg));
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

      const result = Array.from(filters).every((f) => f(fileNotSvg));
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

      const result = Array.from(filters).every((f) => f(fileSvgInFolderFoo));
      expect(result).toBe(false);
    });

    test.each([
      EVENT_PULL_REQUEST,
      EVENT_PUSH,
    ])("filters out SVGs not in context ('%s')", async (eventName) => {
      github.context.eventName = eventName;

      const [filters, err] = await getFilters({ client, config, github });
      expect(err).toBeNull();

      const result = Array.from(filters).every((f) => f(svgNotInContext));
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
