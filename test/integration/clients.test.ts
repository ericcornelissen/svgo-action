import { when } from "jest-when";

import inp from "../__mocks__/inputter.mock";
import * as githubMock from "../__mocks__/@actions/github.mock";

import clients from "../../src/clients";
import Client from "../../src/clients/client";

describe("package clients", () => {
  describe("::New", () => {
    let github, getOctokit;

    beforeAll(() => {
      getOctokit = jest.fn().mockName("getOctokit");
      github = { getOctokit };
    });

    beforeEach(() => {
      inp.getInput.mockReset();
      getOctokit.mockReset();
    });

    function doMockGetInputRepoToken(fn: () => string): void {
      when(inp.getInput)
        .calledWith("repo-token", expect.anything())
        .mockImplementation(fn);
    }

    test("create client", () => {
      const client = { foo: "bar" };

      doMockGetInputRepoToken(() => "token");
      getOctokit.mockReturnValue(client);

      const [result, err] = clients.New({ github, inp });

      expect(err).toBeNull();
      expect(result).toBeDefined();
    });

    test.each(["foo", "bar"])("get repo-token (token: %s)", (token) => {
      doMockGetInputRepoToken(() => token);

      const [, err] = clients.New({ github, inp });

      expect(err).toBeNull();
      expect(getOctokit).toHaveBeenCalledWith(token);
    });

    test("no repo-token", () => {
      doMockGetInputRepoToken(() => { throw new Error(); });

      const [, err] = clients.New({ github, inp });

      expect(err).not.toBeNull();
    });
  });

  describe("Client", () => {
    let client;
    let octokit;

    beforeAll(() => {
      const github = githubMock.createGitHubMock();
      octokit = github.getOctokit("token");
    });

    beforeEach(() => {
      client = new Client(octokit);
    });

    describe("::commits", () => {
      describe("::listFiles", () => {
        beforeEach(() => {
          octokit.rest.repos.getCommit.mockReset();
        });

        test.each([
          [[/* no files */]],
          [[{ filename: "foobar", status: "modified" }]],
        ])("request success (files: `%j`)", async (files) => {
          const owner = "pikachu";
          const repo = "pokédex";
          const ref = "commit-1";

          octokit.rest.repos.getCommit.mockResolvedValueOnce({
            data: { files },
          });

          const [result, err] = await client.commits.listFiles({
            owner,
            repo,
            ref,
          });

          expect(err).toBeNull();
          expect(result).toEqual(files);
          expect(octokit.rest.repos.getCommit).toHaveBeenCalledWith({
            owner,
            repo,
            ref,
          });
        });

        test("request error", async () => {
          const owner = "pikachu";
          const repo = "pokédex";
          const ref = "commit-1";

          octokit.rest.repos.getCommit.mockRejectedValueOnce(new Error());

          const [, err] = await client.commits.listFiles({
            owner,
            repo,
            ref,
          });

          expect(err).not.toBeNull();
        });
      });
    });

    describe("::pulls", () => {
      describe("::listFiles", () => {
        beforeEach(() => {
          octokit.rest.pulls.listFiles.mockReset();
        });

        test.each([
          [[/* no files */]],
          [[{ filename: "foobar", status: "modified" }]],
        ])("request success (files: `%j`)", async (files) => {
          const owner = "pikachu";
          const repo = "pokédex";
          const pullNumber = 42;
          const perPage = 10;
          const page = 1;

          octokit.rest.pulls.listFiles.mockResolvedValueOnce({
            data: files,
          });

          const [result, err] = await client.pulls.listFiles({
            owner,
            repo,
            pullNumber,
            perPage,
            page,
          });

          expect(err).toBeNull();
          expect(result).toEqual(files);
          expect(octokit.rest.pulls.listFiles).toHaveBeenCalledWith({
            owner,
            repo,
            pull_number: pullNumber,
            per_page: perPage,
            page,
          });
        });

        test("request error", async () => {
          const owner = "pikachu";
          const repo = "pokédex";
          const pullNumber = 42;
          const perPage = 10;
          const page = 1;

          octokit.rest.pulls.listFiles.mockRejectedValueOnce(new Error());

          const [, err] = await client.pulls.listFiles({
            owner,
            repo,
            pullNumber,
            perPage,
            page,
          });

          expect(err).not.toBeNull();
        });
      });
    });
  });
});
