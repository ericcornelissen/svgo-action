import * as githubMock from "../../__mocks__/@actions/github.mock";

import Client from "../../../src/clients/client";

describe("clients/client.ts", () => {
  let client;
  let octokit;

  beforeAll(() => {
    const github = githubMock.createGitHubMock();
    octokit = github.getOctokit("token");
  });

  beforeEach(() => {
    client = new Client(octokit);
  });

  describe("::pulls", () => {
    describe("::listFiles", () => {
      beforeEach(() => {
        octokit.rest.pulls.listFiles.mockReset();
      });

      test("request success", async () => {
        const files = [];
        const owner = "pikachu";
        const repo = "pokédex";
        const pullNumber = 42;
        const perPage = 10;
        const page = 1;

        octokit.rest.pulls.listFiles.mockResolvedValueOnce(files);

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
