import { _sampleClient as client } from "../../__mocks__/clients.mock";

import New from "../../../src/filters/pushed-files";
import errors from "../../../src/errors";

describe("filters/pushed-files.ts", () => {
  describe("::New", () => {
    let context;

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

    beforeEach(() => {
      context = {
        payload: {
          commits: [
            { id: "commit-1" },
          ],
        },
        repo: {
          owner: "pikachu",
          repo: "pokédex",
        },
      };

      client.commits.listFiles.mockClear();
    });

    test("use client correctly", async () => {
      const commit = { id: "commit-1" };
      context.payload.commits = [commit];

      const [, err] = await New({ client, context });
      expect(err).toBeNull();
      expect(client.commits.listFiles).toHaveBeenCalledWith({
        owner: context.repo.owner,
        repo: context.repo.repo,
        ref: commit.id,
      });
    });

    test.each([
      2,
      3,
    ])("gets files for every commit (%d commits)", async (commitCount) => {
      expect(commitCount).toBeGreaterThan(0);

      const commits: { id: string }[] = [];
      for (let i = 0; i < commitCount; i++) {
        const files = createFilesList(3);
        client.commits.listFiles.mockResolvedValueOnce([files, null]);
        commits.push({ id: `commit-${i}` });
      }

      context.payload.commits = commits;

      const [, err] = await New({ client, context });
      expect(err).toBeNull();

      expect(client.commits.listFiles).toHaveBeenCalledTimes(commitCount);
    });

    test("the filter", async () => {
      const addedFile = { filename: "foo.bar", status: "added" };
      const modifiedFile = { filename: "hello.world", status: "modified" };
      const removedFile = { filename: "lorem.ipsum", status: "removed" };
      const otherFile = { filename: "praise/the.sun", status: "removed" };

      const files = [addedFile, modifiedFile, removedFile];

      client.commits.listFiles.mockResolvedValueOnce([files, null]);

      const [filter, err] = await New({ client, context });
      expect(err).toBeNull();
      expect(filter).not.toBeNull();

      expect(filter(addedFile.filename)).toBe(true);
      expect(filter(modifiedFile.filename)).toBe(true);
      expect(filter(removedFile.filename)).toBe(false);
      expect(filter(otherFile.filename)).toBe(false);
    });

    test("list commit files error", async () => {
      client.commits.listFiles.mockResolvedValueOnce([
        [],
        errors.New("could not list commit files"),
      ]);

      const [filter, err] = await New({ client, context });
      expect(err).not.toBeNull();
      expect(filter).not.toBeNull();

      const result = filter("foo.bar");
      expect(result).toBe(false);
    });

    test("missing commits from context", async () => {
      delete context.payload.commits;

      const [filter, err] = await New({ client, context });
      expect(err).not.toBeNull();
      expect(filter).not.toBeNull();

      const result = filter("foo.bar");
      expect(result).toBe(false);
    });
  });
});
