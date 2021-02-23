import files from "./fixtures/file-data.json";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);

import { INPUT_NAME_REPO_TOKEN, PR_NOT_FOUND } from "../src/constants";
import {
  createComment,
  getCommitMessage,
  getFile,
  getPrComments,
  getPrNumber,
} from "../src/github-api";
import { GitFileData } from "../src/types";


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
