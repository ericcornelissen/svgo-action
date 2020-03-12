import contentPayloads from "./fixtures/contents-payloads.json";
import files from "./fixtures/file-data.json";

import * as core from "./mocks/@actions/core.mock";
import * as github from "./mocks/@actions/github.mock";

jest.mock("@actions/core", () => core);
jest.mock("@actions/github", () => github);

import {
  PR_NOT_FOUND,

  // Types
  FileData,
  GitBlob,

  // Functions
  commitFiles,
  createBlob,
  getCommitMessage,
  getPrComments,
  getPrFile,
  getPrFiles,
  getPrNumber,
  getRepoFile,
} from "../src/github-api";


const COMMIT_MODE_FILE = "100644";
const COMMIT_TYPE_BLOB = "blob";


const token = core.getInput("repo-token", { required: true });
const client = new github.GitHub(token);

describe("::commitFiles", () => {

  const barBlob: GitBlob = {
    path: "bar.svg",
    mode: COMMIT_MODE_FILE,
    type: COMMIT_TYPE_BLOB,
    sha: "9199acba391dbd22e48a24467b1fb40eaef2495b",
  };
  const complexBlob: GitBlob = {
    path: "complex.svg",
    mode: COMMIT_MODE_FILE,
    type: COMMIT_TYPE_BLOB,
    sha: "34dd32faba391dbd2e48a24467b1fbdddef32599",
  };
  const fooBlob: GitBlob = {
    path: "foo.svg",
    mode: COMMIT_MODE_FILE,
    type: COMMIT_TYPE_BLOB,
    sha: "570afcba391dbd22e48a24467b1fb40eaf233d98",
  };

  const defaultBlobs: GitBlob[] = [fooBlob];
  const defaultCommitMessage = "This is a commit message";

  beforeEach(() => {
    client.git.createBlob.mockClear();
    client.git.createCommit.mockClear();
    client.git.createTree.mockClear();
    client.git.getCommit.mockClear();
    client.git.getRef.mockClear();
    client.git.updateRef.mockClear();
  });

  test("call functions to create a commit", async () => {
    await commitFiles(client, defaultBlobs, defaultCommitMessage);
    expect(client.git.getRef).toHaveBeenCalledTimes(1);
    expect(client.git.getCommit).toHaveBeenCalledTimes(1);
    expect(client.git.createTree).toHaveBeenCalledTimes(1);
    expect(client.git.createCommit).toHaveBeenCalledTimes(1);
    expect(client.git.updateRef).toHaveBeenCalledTimes(1);
  });

  test.each([
    defaultBlobs,
    [complexBlob],
    [fooBlob, barBlob],
  ])("return value for non-empty array of blobs", async (blobs) => {
    const promise = commitFiles(client, blobs as GitBlob[], defaultCommitMessage);
    await expect(promise).resolves.toEqual(
      expect.objectContaining({
        sha: expect.any(String),
        url: expect.any(String),
      }),
    );
  });

  test.each([
    defaultCommitMessage,
    "Optimized SVGs",
    "fix: optimized SVGs",
  ])("uses the commit message (%s)", async (commitMessage) => {
    await commitFiles(client, defaultBlobs, commitMessage);
    expect(client.git.createCommit).toHaveBeenCalledTimes(1);
    expect(client.git.createCommit).toHaveBeenCalledWith(
      expect.objectContaining({
        message: commitMessage,
      }),
    );
  });

  test("empty list of blobs", async () => {
    const promise = commitFiles(client, [/* empty list of blobs */], defaultCommitMessage);
    await expect(promise).resolves.toBeDefined();
  });

  test("ref is not found", async () => {
    github.GitHubInstance.git.getRef.mockRejectedValueOnce(new Error("Not found"));

    const promise = commitFiles(client, defaultBlobs, defaultCommitMessage);
    await expect(promise).rejects.toBeDefined();
  });

  test("previous commit is not found", async () => {
    github.GitHubInstance.git.getCommit.mockRejectedValueOnce(new Error("Not found"));

    const promise = commitFiles(client, defaultBlobs, defaultCommitMessage);
    await expect(promise).rejects.toBeDefined();
  });

  test("tree could not be created", async () => {
    github.GitHubInstance.git.createTree.mockRejectedValueOnce(new Error("Not found"));

    const promise = commitFiles(client, defaultBlobs, defaultCommitMessage);
    await expect(promise).rejects.toBeDefined();
  });

  test("commit could not be created", async () => {
    github.GitHubInstance.git.createCommit.mockRejectedValueOnce(new Error("Not found"));

    const promise = commitFiles(client, defaultBlobs, defaultCommitMessage);
    await expect(promise).rejects.toBeDefined();
  });

  test("ref could not be updated", async () => {
    github.GitHubInstance.git.updateRef.mockRejectedValueOnce(new Error("Not found"));

    const promise = commitFiles(client, defaultBlobs, defaultCommitMessage);
    await expect(promise).rejects.toBeDefined();
  });

  test("the 'pull_request' is missing from context payload", async () => {
    const backup = github.context.payload.pull_request;
    delete github.context.payload.pull_request;

    const promise = commitFiles(client, defaultBlobs, defaultCommitMessage);
    await expect(promise).rejects.toBeDefined();

    github.context.payload.pull_request = backup; /* eslint-disable-line @typescript-eslint/camelcase */
  });

  test("the 'repository' is missing from context payload", async () => {
    const backup = github.context.payload.repository;
    delete github.context.payload.repository;

    const promise = commitFiles(client, defaultBlobs, defaultCommitMessage);
    await expect(promise).rejects.toBeDefined();

    github.context.payload.repository = backup;
  });

});

describe("::createBlob", () => {

  const defaultPath = contentPayloads["test.svg"].path;
  const defaultContent = contentPayloads["test.svg"].content;
  const defaultEncoding = contentPayloads["test.svg"].encoding;

  const testVarious = test.each(
    Object.values(contentPayloads)
      .map(({ path, content, encoding }) => [path, content, encoding])
      .slice(0, 4),
  );

  testVarious("create blob for '%s'", async (path: string, content: string, encoding: string) => {
    await expect(createBlob(
      client,
      path,
      content,
      encoding,
    )).resolves.toEqual(
      expect.objectContaining({
        path: path,
        mode: COMMIT_MODE_FILE,
        type: COMMIT_TYPE_BLOB,
        sha: expect.any(String),
      }),
    );
  });

  test("blob could not be created", async () => {
    github.GitHubInstance.git.createBlob.mockRejectedValueOnce(new Error("Not found"));

    await expect(
      createBlob(
        client,
        defaultPath,
        defaultContent,
        defaultEncoding,
      ),
    ).rejects.toBeDefined();
  });

});

describe("::getCommitMessage", () => {

  test("return a string", async () => {
    const result = await getCommitMessage(client);
    expect(result).toBeDefined();
  });

  test.each([
    "The cake is a lie",
    "These are not the droids you're looking for",
    "Another one bites de_dust",
  ])("return the commit message (%s)", async (commitMessage) => {
    github.GitHubInstance.git.getCommit.mockReturnValueOnce({ data: { message: commitMessage } });

    const result = await getCommitMessage(client);
    expect(result).toBeDefined();
  });

  test("ref is not found", async () => {
    github.GitHubInstance.git.getRef.mockRejectedValueOnce(new Error("Not found"));

    const promise = getCommitMessage(client);
    await expect(promise).rejects.toBeDefined();
  });

  test("commit is not found", async () => {
    github.GitHubInstance.git.getCommit.mockRejectedValueOnce(new Error("Not found"));

    const promise = getCommitMessage(client);
    await expect(promise).rejects.toBeDefined();
  });

});

describe("::getPrComments", () => {

  test("no comments", async () => {
    const comments = getPrComments(client, github.PR_NUMBER.NO_COMMENTS);

    const result: string[] = [];
    for await (const comment of comments) {
      result.push(comment);
    }
    expect(result).toHaveLength(0);
  });

  test("1 comment", async () => {
    const comments = getPrComments(client, github.PR_NUMBER.ONE_COMMENT);

    const result: string[] = [];
    for await (const comment of comments) {
      result.push(comment);
    }
    expect(result).toHaveLength(1);
  });

  test("10 comments", async () => {
    const comments = getPrComments(client, github.PR_NUMBER.TEN_COMMENTS);

    const result: string[] = [];
    for await (const comment of comments) {
      result.push(comment);
    }
    expect(result).toHaveLength(10);
  });

  test("11 comments", async () => {
    const comments = getPrComments(client, github.PR_NUMBER.ELEVEN_COMMENTS);

    const result: string[] = [];
    for await (const comment of comments) {
      result.push(comment);
    }
    expect(result).toHaveLength(11);
  });

  test("17 comments", async () => {
    const comments = getPrComments(client, github.PR_NUMBER.SEVENTEEN_COMMENTS);

    const result: string[] = [];
    for await (const comment of comments) {
      result.push(comment);
    }
    expect(result).toHaveLength(17);
  });

  test("103 comments", async () => {
    const comments = getPrComments(client, github.PR_NUMBER.ONE_HUNDERD_AND_THREE_COMMENTS);

    const result: string[] = [];
    for await (const comment of comments) {
      result.push(comment);
    }
    expect(result).toHaveLength(103);
  });

});

describe("::getPrFile", () => {

  const testFiles = test.each(Object.keys(files).slice(0, 4));

  testFiles("get an existing file (%s)", async (filePath) => {
    const fileData: FileData = await getPrFile(client, filePath);
    expect(fileData).toBeDefined();
  });

  testFiles("'path' is defined for existing file (%s)", async (filePath) => {
    const fileData: FileData = await getPrFile(client, filePath);
    expect(fileData.path).toBeDefined();
  });

  testFiles("'content' is defined for existing file (%s)", async (filePath) => {
    const fileData: FileData = await getPrFile(client, filePath);
    expect(fileData.content).toBeDefined();
  });

  testFiles("'encoding' is defined for existing file (%s)", async (filePath) => {
    const fileData: FileData = await getPrFile(client, filePath);
    expect(fileData.encoding).toBeDefined();
  });

  test("file is not found", async () => {
    github.GitHubInstance.repos.getContents.mockRejectedValueOnce(new Error("Not found"));

    const promise = getPrFile(client, "foobar");
    await expect(promise).rejects.toBeDefined();
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
    github.context.payload.pull_request.number = prNumber;

    const actual: number = getPrNumber();
    expect(actual).toBe(prNumber);
  });

  test("the 'pull_request' is missing from context payload", () => {
    const backup = github.context.payload.pull_request;
    delete github.context.payload.pull_request;

    const actual: number = getPrNumber();
    expect(actual).toBe(PR_NOT_FOUND);

    github.context.payload.pull_request = backup; /* eslint-disable-line @typescript-eslint/camelcase */
  });

});

describe("::getRepoFile", () => {

  const testFiles = test.each(Object.keys(files).slice(0, 4));

  testFiles("return value for an existing file (%s)", async (filePath) => {
    const fileData: FileData = await getRepoFile(client, filePath);
    expect(fileData).toBeDefined();
  });

  testFiles("'path' is defined for existing file (%s)", async (filePath) => {
    const fileData: FileData = await getRepoFile(client, filePath);
    expect(fileData.path).toBeDefined();
  });

  testFiles("'content' is defined for existing file (%s)", async (filePath) => {
    const fileData: FileData = await getRepoFile(client, filePath);
    expect(fileData.content).toBeDefined();
  });

  testFiles("'encoding' is defined for existing file (%s)", async (filePath) => {
    const fileData: FileData = await getRepoFile(client, filePath);
    expect(fileData.encoding).toBeDefined();
  });

  test("throw for non-existent file", async () => {
    github.GitHubInstance.repos.getContents.mockRejectedValueOnce(new Error("Not found"));

    const promise = getRepoFile(client, "9001");
    await expect(promise).rejects.toBeDefined();
  });

});
