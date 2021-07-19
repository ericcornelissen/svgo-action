import { createGitHubMock } from "../../__mocks__/@actions/github.mock";
import * as path from "../../__mocks__/path.mock";
import { _sampleFs as fs } from "../../__mocks__/file-systems.mock";
import { _sampleClient as client } from "../../__mocks__/clients.mock";

import errors from "../../../src/errors";
import { createPrFileSystemBuilder } from "../../../src/file-systems/pr";

describe("file-system/pr.ts", () => {
  let context;

  beforeAll(() => {
    const github = createGitHubMock();
    context = github.context;
    context.payload = {
      pull_request: {
        number: 42,
      },
    };
  });

  describe("Getting", () => {
    const pageSize = 100;

    function createFilesList(length: number): unknown[] {
      const result: unknown[] = [];
      for (let _ = 0; _ < length; _++) {
        result.push({
          status: "added",
          filename: "foo.bar",
        });
      }

      return result;
    }

    test.each([
      1,
      2,
      3,
    ])("paginate Pull Request files (%d pages)", async (pages) => {
      const lastPageSize = 2;
      expect(pages).toBeGreaterThan(0);
      expect(pageSize).toBeGreaterThan(lastPageSize);

      for (let _ = 0; _ < pages - 1; _++) {
        const data = createFilesList(pageSize);
        client.pulls.listFiles.mockResolvedValueOnce([{ data }, null]);
      }

      const data = createFilesList(lastPageSize);
      client.pulls.listFiles.mockResolvedValueOnce([{ data }, null]);

      const builder = createPrFileSystemBuilder({ fs, path });
      const [, err] = await builder(client, context);

      expect(err).toBeNull();
    });

    test("get Pull Request files error", async () => {
      client.pulls.listFiles.mockResolvedValueOnce([
        {},
        errors.New("request failed"),
      ]);

      const builder = createPrFileSystemBuilder({ fs, path });
      const [, err] = await builder(client, context);

      expect(err).not.toBeNull();
    });
  });

  describe("Listing files", () => {
    test.each([
      allFilesAreInThePullRequest,
      someFilesAreNotInThePullRequest,
      fileThatWasDeletedInThePullRequest,
    ])("list files, all files are in Pull Request", async (fn) => {
      const { data, expectedFiles, files } = fn();

      path.resolve.mockImplementation((...args) => args.join("/"));
      client.pulls.listFiles.mockResolvedValueOnce([{ data }, null]);
      fs.listFiles.mockReturnValue(files);

      const builder = createPrFileSystemBuilder({ fs, path });
      const [subject, err] = await builder(client, context);
      expect(err).toBeNull();

      const result = Array.from(subject.listFiles("."));
      expect(result).toEqual(expectedFiles);
    });

    function allFilesAreInThePullRequest() {
      const data = [
        { filename: "foo.bar", status: "added" },
        { filename: "hello.world", status: "modified" },
      ];
      const files = [
        { path: "./foo.bar", extension: "bar" },
        { path: "./hello.world", extension: "world" },
      ];
      const expectedFiles = files;

      return { data, expectedFiles, files };
    }

    function someFilesAreNotInThePullRequest() {
      const data = [
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

      return { data, expectedFiles, files };
    }

    function fileThatWasDeletedInThePullRequest() {
      const data = [
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

      return { data, expectedFiles, files };
    }
  });
});
