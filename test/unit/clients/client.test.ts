jest.mock("@actions/github");
jest.mock("../../../src/errors");

import * as github from "@actions/github";

import Client from "../../../src/clients/client";

type MockedOctokit = jest.MockedObjectDeep<ReturnType<typeof github.getOctokit>>; // eslint-disable-line max-len

describe("clients/client.ts", () => {
  let client: InstanceType<typeof Client>;
  let octokit: MockedOctokit;

  beforeAll(() => {
    const _octokit = github.getOctokit("token");
    octokit = _octokit as MockedOctokit;
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
      ])("request success, %#", async (files) => {
        const owner = "pikachu";
        const repo = "pokédex";
        const ref = "commit-1";

        octokit.rest.repos.getCommit.mockResolvedValueOnce({
          data: { files },
        } as never);

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
        const errorMsg = "something went wrong...";
        const owner = "pikachu";
        const repo = "pokédex";
        const ref = "commit-1";

        octokit.rest.repos.getCommit.mockRejectedValueOnce(new Error(errorMsg));

        const [result, err] = await client.commits.listFiles({
          owner,
          repo,
          ref,
        });

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);

        expect(result).toBeInstanceOf(Array);
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
      ])("request success, %#", async (files) => {
        const owner = "pikachu";
        const repo = "pokédex";
        const pullNumber = 42;
        const perPage = 10;
        const page = 1;

        octokit.rest.pulls.listFiles.mockResolvedValueOnce({
          data: files,
        } as never);

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
        const errorMsg = "something went wrong...";
        const owner = "pikachu";
        const repo = "pokédex";
        const pullNumber = 42;
        const perPage = 10;
        const page = 1;

        octokit.rest.pulls.listFiles.mockRejectedValueOnce(new Error(errorMsg));

        const [, err] = await client.pulls.listFiles({
          owner,
          repo,
          pullNumber,
          perPage,
          page,
        });

        expect(err).not.toBeNull();
        expect(err).toContain(errorMsg);
      });
    });
  });
});
