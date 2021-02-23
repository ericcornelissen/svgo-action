import files from "./fixtures/file-data.json";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);

import { INPUT_NAME_REPO_TOKEN, PR_NOT_FOUND } from "../src/constants";
import {
  createComment,
  getCommitFiles,
  getCommitMessage,
  getContent,
  getDefaultBranch,
  getFile,
  getPrComments,
  getPrFiles,
  getPrNumber,
} from "../src/github-api";
import { GitFileData, GitObjectInfo } from "../src/types";


const token = core.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
const client = github.getOctokit(token);

describe("::createComment", () => {

  test("create a comment", async () => {
    await expect(
      createComment(
        client,
        1,
        "Hello world",
      ),
    ).resolves.toBeUndefined();
  });

  test("comment could not be created", async () => {
    github.GitHubInstance.issues.createComment.mockRejectedValueOnce(new Error("Not found"));

    await expect(
      createComment(
        client,
        1,
        "Hello world",
      ),
    ).rejects.toBeDefined();
  });

});

describe("::getCommitFiles", () => {

  test("return value for a commit with many changes", async () => {
    const files = await getCommitFiles(client, github.COMMIT_SHA.MANY_CHANGES);
    expect(files).toBeDefined();
  });

  test("return value for a commit with no changes", async () => {
    const files = await getCommitFiles(client, github.COMMIT_SHA.NO_CHANGES);
    expect(files).toBeDefined();
  });

  test("throw when commit is not found", async () => {
    github.GitHubInstance.repos.getCommit.mockRejectedValueOnce(new Error("Not found"));

    const promise = getCommitFiles(client, github.COMMIT_SHA.MANY_CHANGES);
    await expect(promise).rejects.toBeDefined();
  });

});

describe("::getCommitMessage", () => {

  const ref = "heads/master";

  test("return a string", async () => {
    const result = await getCommitMessage(client, ref);
    expect(result).toBeDefined();
  });

  test.each([
    "The cake is a lie",
    "These are not the droids you're looking for",
    "Another one bites de_dust",
  ])("return the commit message (%s)", async (commitMessage) => {
    github.GitHubInstance.git.getCommit.mockReturnValueOnce({ data: { message: commitMessage } });

    const result = await getCommitMessage(client, ref);
    expect(result).toBeDefined();
  });

  test("ref is not found", async () => {
    github.GitHubInstance.git.getRef.mockRejectedValueOnce(new Error("Not found"));

    const promise = getCommitMessage(client, ref);
    await expect(promise).rejects.toBeDefined();
  });

  test("commit is not found", async () => {
    github.GitHubInstance.git.getCommit.mockRejectedValueOnce(new Error("Not found"));

    const promise = getCommitMessage(client, ref);
    await expect(promise).rejects.toBeDefined();
  });

});

describe("::getContent", () => {

  const defaultDir = "";
  const defaultRef = github.context.sha;

  test("get an existing directory", async () => {
    const items: GitObjectInfo[] = await getContent(client, defaultRef, defaultDir);
    expect(items).toBeDefined();
  });

  test("'path' is defined for each item", async () => {
    const items: GitObjectInfo[] = await getContent(client, defaultRef, defaultDir);
    expect(items).toBeDefined();

    for (const item of items) {
      expect(item.path).toBeDefined();
    }
  });

  test("'type' is defined for each item", async () => {
    const items: GitObjectInfo[] = await getContent(client, defaultRef, defaultDir);
    expect(items).toBeDefined();

    for (const item of items) {
      expect(item.type).toBeDefined();
    }
  });

  test("directory is not found", async () => {
    github.GitHubInstance.repos.getContent.mockRejectedValueOnce(new Error("Not found"));

    const promise = getContent(client, defaultRef, "foobar");
    await expect(promise).rejects.toBeDefined();
  });

});

describe("::getDefaultBranch", () => {

  const names: string[] = ["main", "develop", "some-other-branch"];

  test.each(names)("returns the repositories default_branch (%s)", async (name) => {
    github.GitHubInstance.repos.get.mockResolvedValueOnce({ data: { default_branch: name } });

    const defaultBranch: string = await getDefaultBranch(client);
    expect(defaultBranch).toBe(name);
  });

});

describe("::getFile", () => {

  const filePaths: string[] = Object.keys(files).slice(0, 4);
  const defaultRef = github.context.sha;

  test.each(filePaths)("get an existing file (%s)", async (filePath) => {
    const fileData: GitFileData = await getFile(client, defaultRef, filePath);
    expect(fileData).toBeDefined();
  });

  test.each(filePaths)("'path' is defined for existing file (%s)", async (filePath) => {
    const fileData: GitFileData = await getFile(client, defaultRef, filePath);
    expect(fileData.path).toBeDefined();
  });

  test.each(filePaths)("'content' is defined for existing file (%s)", async (filePath) => {
    const fileData: GitFileData = await getFile(client, defaultRef, filePath);
    expect(fileData.content).toBeDefined();
  });

  test.each(filePaths)("'encoding' is defined for existing file (%s)", async (filePath) => {
    const fileData: GitFileData = await getFile(client, defaultRef, filePath);
    expect(fileData.encoding).toBeDefined();
  });

  test("file is not found", async () => {
    github.GitHubInstance.repos.getContent.mockRejectedValueOnce(new Error("Not found"));

    const promise = getFile(client, defaultRef, "foobar");
    await expect(promise).rejects.toBeDefined();
  });

});

describe("::getPrComments", () => {

  test("no comments", async () => {
    const result = await getPrComments(client, github.PR_NUMBER.NO_COMMENTS);
    expect(result).toHaveLength(0);
  });

  test("1 comment", async () => {
    const result = await getPrComments(client, github.PR_NUMBER.ONE_COMMENT);
    expect(result).toHaveLength(1);
  });

  test("10 comments", async () => {
    const result = await getPrComments(client, github.PR_NUMBER.TEN_COMMENTS);
    expect(result).toHaveLength(10);
  });

  test("11 comments", async () => {
    const result = await getPrComments(client, github.PR_NUMBER.ELEVEN_COMMENTS);
    expect(result).toHaveLength(11);
  });

  test("17 comments", async () => {
    const result = await getPrComments(client, github.PR_NUMBER.SEVENTEEN_COMMENTS);
    expect(result).toHaveLength(17);
  });

  test("103 comments", async () => {
    const result = await getPrComments(client, github.PR_NUMBER.ONE_HUNDRED_AND_THREE_COMMENTS);
    expect(result).toHaveLength(103);
  });

});

describe("::getPrFiles", () => {

  test("return value for a Pull Request with 1 changed files", async () => {
    const changedFiles = await getPrFiles(client, github.PR_NUMBER.ADD_SVG);
    expect(changedFiles).toBeDefined();
  });

  test("return value for a Pull Request with no changes", async () => {
    const changedFiles = await getPrFiles(client, github.PR_NUMBER.NO_CHANGES);
    expect(changedFiles).toBeDefined();
  });

  test("throw when file in Pull Request does not exist", async () => {
    github.GitHubInstance.pulls.listFiles.mockRejectedValueOnce(new Error("Not found"));

    const promise = getPrFiles(client, github.PR_NUMBER.MANY_CHANGES);
    await expect(promise).rejects.toBeDefined();
  });

});

describe("::getPrNumber", () => {

  test.each([
    github.PR_NUMBER.NO_CHANGES,
    github.PR_NUMBER.MANY_CHANGES,
    github.PR_NUMBER.ADD_SVG,
    github.PR_NUMBER.MODIFY_SVG,
  ])("return value for Pull Request #%i", (prNumber: number) => {
    if (!github.context.payload.pull_request) {
      throw new Error("`github.context.payload.pull_request` cannot be null");
    }

    github.context.payload.pull_request.number = prNumber;

    const actual: number = getPrNumber();
    expect(actual).toBe(prNumber);
  });

  test("the 'pull_request' is missing from context payload", () => {
    const backup = github.context.payload.pull_request;
    delete github.context.payload.pull_request;

    const actual: number = getPrNumber();
    expect(actual).toBe(PR_NOT_FOUND);

    github.context.payload.pull_request = backup;
  });

});
