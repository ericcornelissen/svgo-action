import type { Config } from "../../../src/helpers/filters";
import type { Mutable } from "../../utils";

jest.mock("@actions/github");
jest.mock("../../../src/clients");
jest.mock("../../../src/errors");
jest.mock("../../../src/filters");

import * as github from "@actions/github";

import clients from "../../../src/clients";
import errors from "../../../src/errors";
import filters from "../../../src/filters";
import {
  getFilters,
} from "../../../src/helpers/filters";
import inp from "../../__common__/inputter.mock";

const filtersNewGlobFilter = filters.NewGlobFilter as jest.MockedFunction<typeof filters.NewGlobFilter>; // eslint-disable-line max-len
const filtersNewSvgsFilter = filters.NewSvgsFilter as jest.MockedFunction<typeof filters.NewSvgsFilter>; // eslint-disable-line max-len
const filtersNewPrFilesFilter = filters.NewPrFilesFilter as jest.MockedFunction<typeof filters.NewPrFilesFilter>; // eslint-disable-line max-len
const filtersNewPushedFilesFilter = filters.NewPushedFilesFilter as jest.MockedFunction<typeof filters.NewPushedFilesFilter>; // eslint-disable-line max-len

describe("helpers/filters.ts", () => {
  describe("::getFilters", () => {
    let config: Mutable<Config>;
    let client: ReturnType<typeof clients.New>[0];

    beforeAll(() => {
      [client] = clients.New({ github, inp });
    });

    beforeEach(() => {
      filtersNewGlobFilter.mockClear();
      filtersNewSvgsFilter.mockClear();
      filtersNewPrFilesFilter.mockClear();
      filtersNewPushedFilesFilter.mockClear();
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
        filtersNewGlobFilter.mockResolvedValue(globFilter);

        const [, err] = await getFilters({ client, config, github });
        expect(err).toBeNull();
        expect(filters.NewGlobFilter).toHaveBeenCalledTimes(0);
      });

      test("one glob", async () => {
        config.ignoreGlobs.value = ["foobar/**"];

        const globFilter = jest.fn();
        filtersNewGlobFilter.mockResolvedValue(globFilter);

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
        filtersNewGlobFilter.mockResolvedValueOnce(globFilter1);
        filtersNewGlobFilter.mockResolvedValueOnce(globFilter2);

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
      filtersNewSvgsFilter.mockReturnValue(svgsFilter);

      const [result, err] = await getFilters({ client, config, github });
      expect(err).toBeNull();
      expect(result).toContain(svgsFilter);

      expect(filters.NewSvgsFilter).toHaveBeenCalledTimes(1);
    });

    describe("Pull Request files filter", () => {
      test("event is 'pull_request', no error", async () => {
        github.context.eventName = "pull_request";

        const prFilesFilter = jest.fn();
        filtersNewPrFilesFilter.mockResolvedValue([prFilesFilter, null]);

        const [result, err] = await getFilters({ client, config, github });
        expect(err).toBeNull();
        expect(result).toContain(prFilesFilter);

        expect(filters.NewPrFilesFilter).toHaveBeenCalledTimes(1);
      });

      test("event is 'pull_request', with error", async () => {
        github.context.eventName = "pull_request";
        const error = errors.New("could not get Pull Request");

        const prFilesFilter = jest.fn();
        filtersNewPrFilesFilter.mockResolvedValue([prFilesFilter, error]);

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
        filtersNewPushedFilesFilter.mockResolvedValue([
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
        filtersNewPushedFilesFilter.mockResolvedValue([
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
