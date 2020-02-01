import * as core from "@actions/core";
import * as github from "@actions/github";

jest.mock("@actions/core", () => require("./mocks/@actions/core"));
jest.mock("@actions/github", () => require("./mocks/@actions/github"));

import {
  PR_NOT_FOUND,

  FileData,

  getPrFile,
  getPrNumber,
  getPrFiles,
} from "../src/github-api";


const PR_WITH_NO_CHANGES = 1;
const PR_WITH_ONE_SVG_CHANGED = 2;


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
    const changedFiles = await getPrFiles(client, PR_WITH_ONE_SVG_CHANGED);
    expect(changedFiles).toBeDefined();
  });

  test("return correctly for a Pull Request with no changes", async () => {
    const changedFiles = await getPrFiles(client, PR_WITH_NO_CHANGES);
    expect(changedFiles).toBeDefined();
  });

});

describe("::getPrNumber", () => {

  test.each([1, 2, 5, 42])("return the correct number for Pull Request #%i", (prNumber: number) => {
    github.context.payload.pull_request = { number: prNumber };

    const actual: number = getPrNumber();
    expect(actual).toBe(prNumber);
  });

  test(`return PR_NOT_FOUND (${PR_NOT_FOUND}) when there was no Pull Request in the context`, () => {
    github.context.payload.pull_request = undefined;

    const actual: number = getPrNumber();
    expect(actual).toBe(PR_NOT_FOUND);
  });

});
