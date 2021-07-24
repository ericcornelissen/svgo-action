import { createGitHubMock } from "../__mocks__/@actions/github.mock";
import { _sampleClient as client } from "../__mocks__/clients.mock";

import errors from "../../src/errors";
import fileSystems from "../../src/file-systems";

describe("package file-systems", () => {
  describe("::New", () => {
    let context;

    beforeAll(() => {
      const github = createGitHubMock();
      context = github.context;
    });

    test.each([
      "repository_dispatch",
      "schedule",
      "workflow_dispatch",
    ])("create file system (event: '%s')", async (eventName) => {
      context.eventName = eventName;

      const [fs, err] = await fileSystems.New({ client, context });

      expect(err).toBeNull();
      expect(fs).not.toBeNull();
    });

    describe("create file system (event: 'push')", () => {
      beforeAll(() => {
        client.commits.listFiles.mockResolvedValue([[], null]);
      });

      beforeEach(() => {
        context.eventName = "push";
        context.payload.commits = [
          { id: "commit-1" },
        ];

        client.commits.listFiles.mockClear();
      });

      test("create a file system successfully", async () => {
        client.commits.listFiles.mockResolvedValue([
          [
            { filename: "praise/the.sun", status: "modified" },
            { filename: "foo.bar", status: "added" },
            { filename: "hello.world", status: "removed" },
          ],
          null,
        ]);

        const [fs, err] = await fileSystems.New({ client, context });

        expect(err).toBeNull();
        expect(fs).not.toBeNull();
      });

      test.each([
        [[{ id: "commit-1" }]],
        [[{ id: "commit-1" }, { id: "commit-2" }]],
      ])("uses the client", async (commits) => {
        context.payload.commits = commits;

        const [, err] = await fileSystems.New({ client, context });

        expect(err).toBeNull();
        for (const commit of commits) {
          expect(client.commits.listFiles).toHaveBeenCalledWith({
            owner: context.repo.owner,
            repo: context.repo.repo,
            ref: commit.id,
          });
        }
      });

      test("could not get commit", async () => {
        client.commits.listFiles.mockResolvedValueOnce([
          {},
          errors.New("could not get commit"),
        ]);

        const [, err] = await fileSystems.New({ client, context });

        expect(err).not.toBeNull();
        expect(client.commits.listFiles).toHaveBeenCalled();
      });
    });

    describe("create file system (event: 'pull_request')", () => {
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

      beforeAll(() => {
        client.pulls.listFiles.mockResolvedValue([[], null]);
      });

      beforeEach(() => {
        context.eventName = "pull_request";
        context.payload.pull_request = { number: 42 };

        client.pulls.listFiles.mockClear();
      });

      test("create a file system successfully", async () => {
        const [fs, err] = await fileSystems.New({ client, context });

        expect(err).toBeNull();
        expect(fs).not.toBeNull();
      });

      test("uses the client", async () => {
        const [, err] = await fileSystems.New({ client, context });

        expect(err).toBeNull();
        expect(client.pulls.listFiles).toHaveBeenCalledWith({
          owner: context.repo.owner,
          repo: context.repo.repo,
          pullNumber: context.payload.pull_request.number,
          perPage: pageSize,
          page: expect.any(Number),
        });
      });

      test.each([
        2,
        3,
      ])("paginate Pull Request files (%d pages)", async (pages) => {
        const lastPageSize = 2;
        expect(pages).toBeGreaterThan(0);
        expect(pageSize).toBeGreaterThan(lastPageSize);

        for (let _ = 0; _ < pages - 1; _++) {
          const data = createFilesList(pageSize);
          client.pulls.listFiles.mockResolvedValueOnce([data, null]);
        }

        const data = createFilesList(lastPageSize);
        client.pulls.listFiles.mockResolvedValueOnce([data, null]);

        const [, err] = await fileSystems.New({ client, context });

        expect(err).toBeNull();
        expect(client.pulls.listFiles).toHaveBeenCalledTimes(pages);
      });

      test("could not get Pull Request files", async () => {
        client.pulls.listFiles.mockResolvedValueOnce([
          [],
          errors.New("could not get Pull Request files"),
        ]);

        const [, err] = await fileSystems.New({ client, context });

        expect(err).not.toBeNull();
        expect(client.pulls.listFiles).toHaveBeenCalled();
      });
    });
  });
});
