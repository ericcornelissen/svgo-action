import * as github from "./mocks/@actions/github.mock";

jest.mock("@actions/github", () => github);

import { PR_NOT_FOUND } from "../src/constants";
import {
  createComment,
  getCommitMessage,
  getPrComments,
  getPrNumber,
} from "../src/github-api";


const client = github.getOctokit("token");

describe("::createComment", () => {
  const context = github.MockContext();

  test("create a comment", async () => {
    await expect(
      createComment(
        client,
        context,
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
        context,
        1,
        "Hello world",
      ),
    ).rejects.toBeDefined();
  });

});

describe("::getCommitMessage", () => {

  const context = github.MockContext();
  const ref = "heads/master";

  test("return a string", async () => {
    const result = await getCommitMessage(client, context, ref);
    expect(result).toBeDefined();
  });

  test.each([
    "The cake is a lie",
    "These are not the droids you're looking for",
    "Another one bites de_dust",
  ])("return the commit message (%s)", async (commitMessage) => {
    github.GitHubInstance.git.getCommit.mockReturnValueOnce({ data: { message: commitMessage } });

    const result = await getCommitMessage(client, context, ref);
    expect(result).toBeDefined();
  });

  test("ref is not found", async () => {
    github.GitHubInstance.git.getRef.mockRejectedValueOnce(new Error("Not found"));

    const promise = getCommitMessage(client, context, ref);
    await expect(promise).rejects.toBeDefined();
  });

  test("commit is not found", async () => {
    github.GitHubInstance.git.getCommit.mockRejectedValueOnce(new Error("Not found"));

    const promise = getCommitMessage(client, context, ref);
    await expect(promise).rejects.toBeDefined();
  });

});

describe("::getPrComments", () => {

  const context = github.MockContext();

  test("no comments", async () => {
    const result = await getPrComments(client, context ,github.PR_NUMBER.NO_COMMENTS);
    expect(result).toHaveLength(0);
  });

  test("1 comment", async () => {
    const result = await getPrComments(client, context, github.PR_NUMBER.ONE_COMMENT);
    expect(result).toHaveLength(1);
  });

  test("10 comments", async () => {
    const result = await getPrComments(client, context, github.PR_NUMBER.TEN_COMMENTS);
    expect(result).toHaveLength(10);
  });

  test("11 comments", async () => {
    const result = await getPrComments(client, context, github.PR_NUMBER.ELEVEN_COMMENTS);
    expect(result).toHaveLength(11);
  });

  test("17 comments", async () => {
    const result = await getPrComments(client, context, github.PR_NUMBER.SEVENTEEN_COMMENTS);
    expect(result).toHaveLength(17);
  });

  test("103 comments", async () => {
    const result = await getPrComments(client, context, github.PR_NUMBER.ONE_HUNDRED_AND_THREE_COMMENTS);
    expect(result).toHaveLength(103);
  });

});

describe("::getPrNumber", () => {

  test.each([
    github.PR_NUMBER.NO_COMMENTS,
    github.PR_NUMBER.ONE_COMMENT,
    github.PR_NUMBER.TEN_COMMENTS,
    github.PR_NUMBER.ONE_HUNDRED_AND_THREE_COMMENTS,
  ])("return value for Pull Request #%i", (prNumber: number) => {
    const context = github.MockContext({
      payload: {
        pull_request: { number: prNumber },
      },
    });

    const actual: number = getPrNumber(context);
    expect(actual).toBe(prNumber);
  });

  test("the 'pull_request' is missing from context payload", () => {
    const context = github.MockContext({ payload: { pull_request: null } });

    const actual: number = getPrNumber(context);
    expect(actual).toBe(PR_NOT_FOUND);
  });

});
