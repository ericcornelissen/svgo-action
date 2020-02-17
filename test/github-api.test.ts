import * as coreMock from "./mocks/@actions/core.mock";
import * as githubMock from "./mocks/@actions/github.mock";

jest.mock("@actions/core", () => coreMock);
jest.mock("@actions/github", () => githubMock);

import contentPayloads from "./fixtures/contents-payloads.json";

import * as core from "@actions/core";
import * as github from "@actions/github";

import {
  PR_NOT_FOUND,

  FileData,

  commitFile,
  getPrFile,
  getPrNumber,
  getPrFiles,
} from "../src/github-api";


describe("::commitFile", () => {

  const token: string = core.getInput("repo-token", { required: true });
  const client: github.GitHub = new github.GitHub(token);

  const testVarious = test.each(Object.values(contentPayloads).map(data => {
    return [data.path, data.content, data.encoding];
  }));

  testVarious("does not throw for '%s'", (path, content, encoding) => {
    const commitMessage = `Commiting ${path}`;

    return expect(commitFile(
      client,
      path,
      content,
      encoding,
      commitMessage,
    )).resolves.toEqual(expect.any(Object));
  });

});

describe("::getPrFile", () => {

  const EXISTING_FILE_PATH = "test.svg";

  const token: string = core.getInput("repo-token", { required: true });
  const client: github.GitHub = new github.GitHub(token);

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

});

describe("::getPrFiles", () => {

  const token: string = core.getInput("repo-token", { required: true });
  const client: github.GitHub = new github.GitHub(token);

  test("return correctly for a Pull Request with 1 changed files", async () => {
    const changedFiles = await getPrFiles(client, githubMock.PR_NUMBER.ADD_SVG);
    expect(changedFiles).toBeDefined();
  });

  test("return correctly for a Pull Request with no changes", async () => {
    const changedFiles = await getPrFiles(client, githubMock.PR_NUMBER.NO_CHANGES);
    expect(changedFiles).toBeDefined();
  });

});

describe("::getPrNumber", () => {

  test.each([1, 2, 5, 42])("return the correct number for Pull Request #%i", (prNumber: number) => {
    github.context.payload.pull_request = { /* eslint-disable-line @typescript-eslint/camelcase */
      number: prNumber,
    };

    const actual: number = getPrNumber();
    expect(actual).toBe(prNumber);
  });

  test(`return PR_NOT_FOUND (${PR_NOT_FOUND}) when there was no Pull Request in the context`, () => {
    github.context.payload.pull_request = undefined; /* eslint-disable-line @typescript-eslint/camelcase */

    const actual: number = getPrNumber();
    expect(actual).toBe(PR_NOT_FOUND);
  });

});
