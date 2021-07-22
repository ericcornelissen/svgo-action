import { when } from "jest-when";

import { createGitHubMock } from "../../__mocks__/@actions/github.mock";
import * as path from "../../__mocks__/path.mock";
import { _sampleFs as fs } from "../../__mocks__/file-systems.mock";
import { _sampleClient as client } from "../../__mocks__/clients.mock";

import errors from "../../../src/errors";
import { createPushFileSystemBuilder } from "../../../src/file-systems/push";

describe("file-systems/push.ts", () => {
  let context;

  beforeAll(() => {
    const github = createGitHubMock();
    context = github.context;
    context.payload = {
      commits: [],
    };
  });

  describe("Getting", () => {
    test.each([
      [[/* no commits */]],
      [[{ id: "commit-1" }]],
      [[{ id: "commit-1" }, { id: "commit-2" }]],
    ])("get all files from all commits (commits: `%p`)", async (commits) => {
      context.payload.commits = commits;

      for (const commit of commits) {
        when(client.commits.listFiles)
          .calledWith(expect.objectContaining({ ref: commit.id }))
          .mockResolvedValue([[], null]);
      }

      const builder = createPushFileSystemBuilder({ fs, path });
      const [, err] = await builder(client, context);

      expect(err).toBeNull();
    });

    test("get commits/files error", async () => {
      client.commits.listFiles.mockResolvedValueOnce([
        {},
        errors.New("request failed"),
      ]);

      const builder = createPushFileSystemBuilder({ fs, path });
      const [, err] = await builder(client, context);

      expect(err).not.toBeNull();
    });
  });

  describe("Listing files", () => {
    beforeAll(() => {
      path.resolve.mockImplementation((...args) => args.join("/"));
    });

    test.each([
      allFilesAreInTheCommits,
      someFilesAreNotInTheCommits,
      fileThatWasDeletedInTheCommits,
    ])("list files", async (fn) => {
      const { commitFiles, expectedFiles, files } = fn();

      context.payload.commits = [{ id: "commit-1" }];
      client.commits.listFiles.mockResolvedValueOnce([commitFiles, null]);
      fs.listFiles.mockReturnValue(files);

      const builder = createPushFileSystemBuilder({ fs, path });
      const [subject, err] = await builder(client, context);
      expect(err).toBeNull();

      const result = Array.from(subject.listFiles("."));
      expect(result).toEqual(expectedFiles);
    });

    function allFilesAreInTheCommits() {
      const commitFiles = [
        { filename: "foo.bar", status: "added" },
        { filename: "hello.world", status: "modified" },
      ];
      const files = [
        { path: "./foo.bar", extension: "bar" },
        { path: "./hello.world", extension: "world" },
      ];
      const expectedFiles = files;

      return { commitFiles, expectedFiles, files };
    }

    function someFilesAreNotInTheCommits() {
      const commitFiles = [
        { filename: "foo.bar", status: "added" },
        { filename: "hello.world", status: "removed" },
      ];
      const expectedFiles = [
        { path: "./foo.bar", extension: "bar" },
      ];
      const files = [
        ...expectedFiles,
        { path: "./hello.world", extension: "world" },
      ];

      return { commitFiles, expectedFiles, files };
    }

    function fileThatWasDeletedInTheCommits() {
      const commitFiles = [
        { filename: "foo.bar", status: "added" },
        { filename: "hello.world", status: "removed" },
      ];
      const expectedFiles = [
        { path: "./foo.bar", extension: "bar" },
      ];
      const files = [
        ...expectedFiles,
        { path: "./hello.world", extension: "world" },
      ];

      return { commitFiles, expectedFiles, files };
    }
  });
});
