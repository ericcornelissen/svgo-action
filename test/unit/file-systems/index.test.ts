import { createGitHubMock } from "../../__mocks__/@actions/github.mock";
import { _sampleClient as client } from "../../__mocks__/clients.mock";

const BaseFileSystemMock = {
  listFiles: jest.fn()
    .mockReturnValue([])
    .mockName("BaseFileSystem.listFiles"),
  readFile: jest.fn()
    .mockReturnValue(["", null])
    .mockName("BaseFileSystem.readFile"),
  writeFile: jest.fn()
    .mockReturnValue(null)
    .mockName("BaseFileSystem.writeFile"),
};
const baseMock = { BaseFileSystem: BaseFileSystemMock };

const newPullRequestMock = jest.fn()
  .mockResolvedValue([BaseFileSystemMock, null])
  .mockName("newPullRequest");
const prMock = {
  createPrFileSystemBuilder: jest.fn().mockReturnValue(newPullRequestMock),
};

jest.mock("../../../src/file-systems/base", () => baseMock);
jest.mock("../../../src/file-systems/pr", () => prMock);

import fileSystems from "../../../src/file-systems";
import errors from "../../../src/errors";

describe("file-system/index.ts", () => {
  describe("::New", () => {
    let context;

    beforeAll(() => {
      const github = createGitHubMock();
      context = github.context;
    });

    test.each([
      "push",
      "repository_dispatch",
      "schedule",
      "workflow_dispatch",
    ])("create file system (event: '%s')", async (eventName) => {
      context.eventName = eventName;

      const [fs, err] = await fileSystems.New({ client, context });

      expect(err).toBeNull();
      expect(fs).toBe(BaseFileSystemMock);
    });

    describe("create file system (event: 'pull_request')", () => {
      beforeEach(() => {
        context.eventName = "pull_request";
      });

      test("success", async () => {
        const fileSystem = {};

        newPullRequestMock.mockResolvedValueOnce([fileSystem, null]);

        const [fs, err] = await fileSystems.New({ client, context });
        expect(err).toBeNull();
        expect(fs).toBe(fileSystem);
      });

      test("failure", async () => {
        newPullRequestMock.mockResolvedValueOnce([null, errors.New("failed")]);

        const [, err] = await fileSystems.New({ client, context });
        expect(err).not.toBeNull();
      });
    });
  });
});
