import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);

import contentPayloads from "./fixtures/contents-payloads.json";

import {
  PR_NOT_FOUND,

  // Types
  FileData,

  // Functions
  commitFile,
  getPrFile,
  getPrFiles,
  getPrNumber,
} from "../src/github-api";


const token = core.getInput("repo-token", { required: true });
const client = new github.GitHub(token);


describe("::commitFile", () => {

  const defaultCommitMessage = "Does this commit?";
  const defaultPath = contentPayloads["test.svg"].path;
  const defaultContent = contentPayloads["test.svg"].content;
  const defaultEncoding = contentPayloads["test.svg"].encoding;

  const testVarious = test.each(
    Object.values(contentPayloads)
      .map(data => {
        return [data.path, data.content, data.encoding];
      })
      .slice(0, 3),
  );

  beforeEach(() => {
    client.git.getRef.mockClear();
    client.git.getCommit.mockClear();
    client.git.createBlob.mockClear();
    client.git.createTree.mockClear();
    client.git.createCommit.mockClear();
    client.git.updateRef.mockClear();
  });

  testVarious("does not throw for '%s'", (path: string, content: string, encoding: string) => {
    return expect(commitFile(
      client,
      path,
      content,
      encoding,
      defaultCommitMessage,
    )).resolves.toEqual(
      expect.objectContaining({
        sha: expect.any(String),
        url: expect.any(String),
      }),
    );
  });

  test("calls functions to create a commit", async () => {
    await commitFile(
      client,
      defaultPath,
      defaultContent,
      defaultEncoding,
      defaultCommitMessage,
    );

    expect(client.git.getRef).toHaveBeenCalledTimes(1);
    expect(client.git.getCommit).toHaveBeenCalledTimes(1);
    expect(client.git.createBlob).toHaveBeenCalled();
    expect(client.git.createTree).toHaveBeenCalled();
    expect(client.git.createCommit).toHaveBeenCalledTimes(1);
    expect(client.git.updateRef).toHaveBeenCalledTimes(1);
  });

  testVarious("Custom commit message for '%s'", async (path: string, content: string, encoding: string) => {
    const commitMessage = `Commiting ${path}`;

    await commitFile(client, path, content, encoding, commitMessage);

    expect(client.git.createCommit).toHaveBeenCalledTimes(1);
    expect(client.git.createCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        message: commitMessage,
      }),
    );
  });

  test("throw when ref is not found", () => {
    github.GitHubInstance.git.getRef.mockRejectedValueOnce(new Error("Not found"));

    return expect(commitFile(client,
      defaultPath,
      defaultContent,
      defaultEncoding,
      defaultCommitMessage,
      )).rejects.toBeDefined();
  });

  test("throw when previous commit is not found", () => {
    github.GitHubInstance.git.getCommit.mockRejectedValueOnce(new Error("Not found"));

    return expect(commitFile(client,
      defaultPath,
      defaultContent,
      defaultEncoding,
      defaultCommitMessage,
      )).rejects.toBeDefined();
  });

  test("throw when blob could not be created", () => {
    github.GitHubInstance.git.createBlob.mockRejectedValueOnce(new Error("Not found"));

    return expect(commitFile(client,
      defaultPath,
      defaultContent,
      defaultEncoding,
      defaultCommitMessage,
      )).rejects.toBeDefined();
  });

  test("throw when tree could not be created", () => {
    github.GitHubInstance.git.createTree.mockRejectedValueOnce(new Error("Not found"));

    return expect(commitFile(client,
      defaultPath,
      defaultContent,
      defaultEncoding,
      defaultCommitMessage,
      )).rejects.toBeDefined();
  });

  test("throw when commit could not be created", () => {
    github.GitHubInstance.git.createCommit.mockRejectedValueOnce(new Error("Not found"));

    return expect(commitFile(client,
      defaultPath,
      defaultContent,
      defaultEncoding,
      defaultCommitMessage,
      )).rejects.toBeDefined();
  });

  test("throw when ref could not be updated", () => {
    github.GitHubInstance.git.updateRef.mockRejectedValueOnce(new Error("Not found"));

    return expect(commitFile(client,
      defaultPath,
      defaultContent,
      defaultEncoding,
      defaultCommitMessage,
      )).rejects.toBeDefined();
  });

});

describe("::getPrFile", () => {

  const EXISTING_FILE_PATH = "test.svg";

  test("return something when requesting data for an existing file", async () => {
    const fileData: FileData = await getPrFile(client, EXISTING_FILE_PATH);
    expect(fileData).toBeDefined();
  });

  test("'path' is defined for existing file", async () => {
    const fileData: FileData = await getPrFile(client, EXISTING_FILE_PATH);
    expect(fileData.path).toBeDefined();
  });

  test("'content' is defined for existing file", async () => {
    const fileData: FileData = await getPrFile(client, EXISTING_FILE_PATH);
    expect(fileData.content).toBeDefined();
  });

  test("'encoding' is defined for existing file", async () => {
    const fileData: FileData = await getPrFile(client, EXISTING_FILE_PATH);
    expect(fileData.encoding).toBeDefined();
  });

  test("throw for non-existent file", () => {
    return expect(getPrFile(client, "foobar")).rejects.toBeDefined();
  });

});

describe("::getPrFiles", () => {

  test("return correctly for a Pull Request with 1 changed files", async () => {
    const changedFiles = await getPrFiles(client, github.PR_NUMBER.ADD_SVG);
    expect(changedFiles).toBeDefined();
  });

  test("return correctly for a Pull Request with no changes", async () => {
    const changedFiles = await getPrFiles(client, github.PR_NUMBER.NO_CHANGES);
    expect(changedFiles).toBeDefined();
  });

  test("throw for non-existent file", () => {
    return expect(getPrFiles(client, -1)).rejects.toBeDefined();
  });

});

describe("::getPrNumber", () => {

  test.each([
    github.PR_NUMBER.NO_CHANGES,
    github.PR_NUMBER.MANY_CHANGES,
    github.PR_NUMBER.ADD_SVG,
    github.PR_NUMBER.MODIFY_SVG,
  ])("return the correct number for Pull Request #%i", (prNumber: number) => {
    github.context.payload.pull_request.number = prNumber; /* eslint-disable-line @typescript-eslint/camelcase */

    const actual: number = getPrNumber();
    expect(actual).toBe(prNumber);
  });

  test(`return PR_NOT_FOUND (${PR_NOT_FOUND}) when there was no Pull Request in the context`, () => {
    delete github.context.payload.pull_request; /* eslint-disable-line @typescript-eslint/camelcase */

    const actual: number = getPrNumber();
    expect(actual).toBe(PR_NOT_FOUND);
  });

});
