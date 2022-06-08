jest.dontMock("minimatch");

jest.mock("@actions/github");

import * as github from "@actions/github";

import clients from "../../src/clients";
import filters from "../../src/filters";
import { createFilesList } from "../__common__/generate";
import inp from "../__common__/inputter.mock";

describe("package filters", () => {
  describe("::NewGlobFilter", () => {
    test("glob matches", () => {
      const glob = "*.bar";
      const filepath = "foo.bar";

      const filter = filters.NewGlobFilter(glob);
      const result = filter(filepath);
      expect(result).toBe(false);
    });

    test("glob does not match", () => {
      const glob = "*.html";
      const filepath = "foobar.svg";

      const filter = filters.NewGlobFilter(glob);
      const result = filter(filepath);
      expect(result).toBe(true);
    });
  });

  describe("::NewPrFilesFilter", () => {
    let client;
    let context;
    let octokit;

    const pageSize = 100;

    beforeAll(() => {
      [client] = clients.New({ github, inp });
      context = github.context;
      octokit = github.getOctokit("token");
    });

    beforeEach(() => {
      context.payload = {
        pull_request: {
          number: 42,
        },
      };
    });

    test("file in Pull Request", async () => {
      const filepath = "foobar.svg";

      octokit.rest.pulls.listFiles.mockResolvedValueOnce({
        data: [
          { filename: filepath, status: "added" },
          { filename: "hello.world", status: "removed" },
        ],
      });

      const [filter, err] = await filters.NewPrFilesFilter({ client, context });
      expect(err).toBeNull();

      const result = filter(filepath);
      expect(result).toBe(true);
    });

    test("file not in Pull Request", async () => {
      const filepath = "foobar.svg";

      octokit.rest.pulls.listFiles.mockResolvedValueOnce({
        data: [
          { filename: "praise/the.sun", status: "added" },
          { filename: "hello.world", status: "removed" },
        ],
      });

      const [filter, err] = await filters.NewPrFilesFilter({ client, context });
      expect(err).toBeNull();

      const result = filter(filepath);
      expect(result).toBe(false);
    });

    test("multiple pages", async () => {
      const filepath = "foobar.svg";

      const firstPageData = createFilesList(pageSize);
      octokit.rest.pulls.listFiles.mockResolvedValueOnce({
        data: firstPageData,
      });
      octokit.rest.pulls.listFiles.mockResolvedValueOnce({
        data: [
          { filename: filepath, status: "added" },
        ],
      });

      const [filter, err] = await filters.NewPrFilesFilter({ client, context });
      expect(err).toBeNull();

      const result = filter(filepath);
      expect(result).toBe(true);
    });

    test("missing Pull Request number", async () => {
      context.payload = {
        pull_request: undefined,
      };

      const [filter, err] = await filters.NewPrFilesFilter({ client, context });
      expect(err).not.toBeNull();

      const result = filter("foobar.svg");
      expect(result).toBe(false);
    });

    test("list Pull Request files error", async () => {
      octokit.rest.pulls.listFiles.mockRejectedValueOnce(new Error("500"));

      const [filter, err] = await filters.NewPrFilesFilter({ client, context });
      expect(err).not.toBeNull();

      const result = filter("foobar.svg");
      expect(result).toBe(false);
    });
  });

  describe("::NewPushedFilesFilter", () => {
    let client;
    let context;
    let octokit;

    beforeAll(() => {
      [client] = clients.New({ github, inp });
      context = github.context;
      octokit = github.getOctokit("token");
    });

    beforeEach(() => {
      context.payload = {
        commits: [
          { id: "commit-1" },
        ],
      };
    });

    test("file in commits", async () => {
      const filepath = "foobar.svg";

      octokit.rest.repos.getCommit.mockResolvedValueOnce({
        data: {
          files: [
            { filename: filepath, status: "added" },
            { filename: "hello.world", status: "removed" },
          ],
        },
      });

      const [filter, err] = await filters.NewPushedFilesFilter({
        client,
        context,
      });
      expect(err).toBeNull();

      const result = filter(filepath);
      expect(result).toBe(true);
    });

    test("file not in commits", async () => {
      const filepath = "foobar.svg";

      octokit.rest.repos.getCommit.mockResolvedValueOnce({
        data: {
          files: [
            { filename: "praise/the.sun", status: "added" },
            { filename: "hello.world", status: "removed" },
          ],
        },
      });

      const [filter, err] = await filters.NewPushedFilesFilter({
        client,
        context,
      });
      expect(err).toBeNull();

      const result = filter(filepath);
      expect(result).toBe(false);
    });

    test("no commits", async () => {
      context.payload = {
        commits: [],
      };

      const [filter, err] = await filters.NewPushedFilesFilter({
        client,
        context,
      });
      expect(err).toBeNull();

      const result = filter("foobar.svg");
      expect(result).toBe(false);
    });

    test("missing commits", async () => {
      context.payload = {
        commits: undefined,
      };

      const [filter, err] = await filters.NewPushedFilesFilter({
        client,
        context,
      });
      expect(err).not.toBeNull();

      const result = filter("foobar.svg");
      expect(result).toBe(false);
    });

    test("list commit files error", async () => {
      octokit.rest.repos.getCommit.mockRejectedValueOnce(new Error("500"));

      const [filter, err] = await filters.NewPushedFilesFilter({
        client,
        context,
      });
      expect(err).not.toBeNull();

      const result = filter("foobar.svg");
      expect(result).toBe(false);
    });
  });

  describe("::NewSvgsFilter", () => {
    test("an svg", () => {
      const filepath = "foobar.svg";

      const filter = filters.NewSvgsFilter();
      const result = filter(filepath);
      expect(result).toBe(true);
    });

    test("not an svg", () => {
      const filepath = "foo.bar";

      const filter = filters.NewSvgsFilter();
      const result = filter(filepath);
      expect(result).toBe(false);
    });
  });
});
