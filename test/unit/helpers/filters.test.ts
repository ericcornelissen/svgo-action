import { mocked } from "ts-jest/utils";

import inp from "../../__common__/inputter.mock";

jest.mock("@actions/github");
jest.mock("../../../src/clients");
jest.mock("../../../src/errors");
jest.mock("../../../src/filters");

import * as github from "@actions/github";

import errors from "../../../src/errors";
import clients from "../../../src/clients";
import _filters from "../../../src/filters";

import {
  getFilters,
} from "../../../src/helpers/filters";

const filters = mocked(_filters);

describe("helpers/filters.ts", () => {
  describe("::getFilters", () => {
    let config;
    let client;

    beforeAll(() => {
      const [_client] = clients.New({ github, inp });
      client = _client;
    });

    beforeEach(() => {
      filters.NewGlobFilter.mockClear();
      filters.NewSvgsFilter.mockClear();
      filters.NewPrFilesFilter.mockClear();
      filters.NewPushedFilesFilter.mockClear();
    });

    beforeEach(() => {
      config = {
        ignoreGlobs: {
          value: [],
        },
      };
    });

    describe("Glob filter", () => {
      beforeEach(() => {
        github.context.eventName = "foobar";
      });

      test("zero globs", async () => {
        config.ignoreGlobs.value = [];

        const globFilter = jest.fn();
        filters.NewGlobFilter.mockReturnValue(globFilter);

        const [, err] = await getFilters({ client, config, github });
        expect(err).toBeNull();
        expect(filters.NewGlobFilter).toHaveBeenCalledTimes(0);
      });

      test("one glob", async () => {
        config.ignoreGlobs.value = ["foobar/**"];

        const globFilter = jest.fn();
        filters.NewGlobFilter.mockReturnValue(globFilter);

        const [result, err] = await getFilters({ client, config, github });
        expect(err).toBeNull();
        expect(result).toContain(globFilter);

        expect(filters.NewGlobFilter).toHaveBeenCalledTimes(1);
      });

      test("multiple globs", async () => {
        const glob1 = "foo/**";
        const glob2 = "bar/**";
        config.ignoreGlobs.value = [glob1, glob2];

        const globFilter1 = jest.fn();
        const globFilter2 = jest.fn();
        filters.NewGlobFilter.mockReturnValueOnce(globFilter1);
        filters.NewGlobFilter.mockReturnValueOnce(globFilter2);

        const [result, err] = await getFilters({ client, config, github });
        expect(err).toBeNull();
        expect(result).toContain(globFilter1);
        expect(result).toContain(globFilter2);

        expect(filters.NewGlobFilter).toHaveBeenCalledTimes(2);
      });
    });

    test("returns an SVGs filter", async () => {
      github.context.eventName = "foobar";

      const svgsFilter = jest.fn();
      filters.NewSvgsFilter.mockReturnValue(svgsFilter);

      const [result, err] = await getFilters({ client, config, github });
      expect(err).toBeNull();
      expect(result).toContain(svgsFilter);

      expect(filters.NewSvgsFilter).toHaveBeenCalledTimes(1);
    });

    describe("Pull Request files filter", () => {
      test("event is 'pull_request', no error", async () => {
        github.context.eventName = "pull_request";

        const prFilesFilter = jest.fn();
        filters.NewPrFilesFilter.mockResolvedValue([prFilesFilter, null]);

        const [result, err] = await getFilters({ client, config, github });
        expect(err).toBeNull();
        expect(result).toContain(prFilesFilter);

        expect(filters.NewPrFilesFilter).toHaveBeenCalledTimes(1);
      });

      test("event is 'pull_request', with error", async () => {
        github.context.eventName = "pull_request";
        const error = errors.New("could not get Pull Request");

        const prFilesFilter = jest.fn();
        filters.NewPrFilesFilter.mockResolvedValue([prFilesFilter, error]);

        const [, err] = await getFilters({ client, config, github });
        expect(err).not.toBeNull();

        expect(filters.NewPrFilesFilter).toHaveBeenCalledTimes(1);
      });

      test("event is not 'pull_request'", async () => {
        github.context.eventName = "foobar";

        const [, err] = await getFilters({ client, config, github });
        expect(err).toBeNull();

        expect(filters.NewPrFilesFilter).not.toHaveBeenCalled();
      });
    });

    describe("Pushed files filter", () => {
      test("event is 'push', no error", async () => {
        github.context.eventName = "push";

        const pushFilesFilter = jest.fn();
        filters.NewPushedFilesFilter.mockResolvedValue([
          pushFilesFilter,
          null,
        ]);

        const [result, err] = await getFilters({ client, config, github });
        expect(err).toBeNull();
        expect(result).toContain(pushFilesFilter);

        expect(filters.NewPushedFilesFilter).toHaveBeenCalledTimes(1);
      });

      test("event is 'push', with error", async () => {
        github.context.eventName = "push";
        const error = errors.New("could not get commits");

        const pushFilesFilter = jest.fn();
        filters.NewPushedFilesFilter.mockResolvedValue([
          pushFilesFilter,
          error,
        ]);

        const [, err] = await getFilters({ client, config, github });
        expect(err).not.toBeNull();

        expect(filters.NewPushedFilesFilter).toHaveBeenCalledTimes(1);
      });

      test("event is not 'push'", async () => {
        github.context.eventName = "foobar";

        const [, err] = await getFilters({ client, config, github });
        expect(err).toBeNull();

        expect(filters.NewPushedFilesFilter).not.toHaveBeenCalled();
      });
    });
  });
});
