import type { error } from "../../../src/types";

import { mocked } from "ts-jest/utils";

import { createGitHubMock } from "../../__mocks__/@actions/github.mock";
import { _sampleClient as client } from "../../__mocks__/clients.mock";

jest.mock("../../../src/file-systems/base");
jest.mock("../../../src/file-systems/filtered");

import _NewBaseFileSystem from "../../../src/file-systems/base";
import _NewFilteredFileSystem from "../../../src/file-systems/filtered";
import fileSystems from "../../../src/file-systems/index";
import errors from "../../../src/errors";

const NewBaseFileSystem = mocked(_NewBaseFileSystem);
const NewFilteredFileSystem = mocked(_NewFilteredFileSystem);

describe("file-system/index.ts", () => {
  describe("::New", () => {
    let context;

    const fileSystem = {
      listFiles: () => [],
      readFile: (): Promise<[string, error]> => Promise.resolve(["", null]),
      writeFile: (): Promise<error> => Promise.resolve(null),
    };

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
      NewBaseFileSystem.mockReturnValueOnce(fileSystem);

      const [fs, err] = await fileSystems.New({ client, context });
      expect(err).toBeNull();

      expect(fs).toBe(fileSystem);
      expect(NewBaseFileSystem).toHaveBeenCalled();
      expect(NewFilteredFileSystem).not.toHaveBeenCalled();
    });

    describe("create file system (event: 'push')", () => {
      beforeEach(() => {
        context.eventName = "push";
        context.payload.commits = [
          { id: "commit-1" },
        ];
      });

      test("success", async () => {
        client.commits.listFiles.mockReturnValueOnce([
          [
            { filename: "foo.bar", status: "modified" },
            { filename: "hello.world", status: "added" },
            { filename: "lorem.ipsum", status: "removed" },
          ],
          null,
        ]);
        NewFilteredFileSystem.mockReturnValueOnce(fileSystem);

        const [fs, err] = await fileSystems.New({ client, context });
        expect(err).toBeNull();

        expect(fs).toBe(fileSystem);
        expect(NewFilteredFileSystem).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.arrayContaining([expect.any(Function)]),
          }),
        );
      });

      test("failure", async () => {
        client.commits.listFiles.mockReturnValueOnce([
          [],
          errors.New("client.commits.listFiles failed"),
        ]);

        const [, err] = await fileSystems.New({ client, context });
        expect(err).not.toBeNull();
      });
    });

    describe("create file system (event: 'pull_request')", () => {
      beforeEach(() => {
        context.eventName = "pull_request";
        context.payload.pull_request = {
          number: 42,
        };
      });

      test("success", async () => {
        client.pulls.listFiles.mockReturnValueOnce([
          [
            { filename: "foo.bar", status: "modified" },
            { filename: "hello.world", status: "added" },
            { filename: "lorem.ipsum", status: "removed" },
          ],
          null,
        ]);
        NewFilteredFileSystem.mockReturnValueOnce(fileSystem);

        const [fs, err] = await fileSystems.New({ client, context });
        expect(err).toBeNull();

        expect(fs).toBe(fileSystem);
        expect(NewFilteredFileSystem).toHaveBeenCalledWith(
          expect.objectContaining({
            filters: expect.arrayContaining([expect.any(Function)]),
          }),
        );
      });

      test("failure", async () => {
        client.pulls.listFiles.mockReturnValueOnce([
          [],
          errors.New("client.pulls.listFiles failed"),
        ]);


        const [, err] = await fileSystems.New({ client, context });
        expect(err).not.toBeNull();
      });
    });
  });
});
