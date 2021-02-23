import { Octokit } from "@octokit/core";

import * as github from "./@actions/github.mock";

import { GitFileData } from "../../src/types";


async function _getContent(
  client: Octokit,
  ref: string,
  path: string,
): Promise<GitFileData> {
  const { data } = await client.repos.getContent({
    owner: "mew",
    repo: "svg-action",
    path,
    ref,
  });

  return {
    path: data.path,
    content: data.content,
    encoding: data.encoding,
  };
}


export const createComment = jest.fn()
  .mockName("github-api.createComment");

export const getCommitMessage = jest.fn()
  .mockResolvedValue("This is a commit message")
  .mockName("github-api.getCommitMessage");

export const getFile = jest.fn()
  .mockImplementation(_getContent)
  .mockName("github-api.getFile");

export const getPrComments = jest.fn()
  .mockResolvedValue([])
  .mockName("github-api.getPrComment");

export const getPrNumber = jest.fn()
  .mockReturnValue(github.PR_NUMBER.NO_CHANGES)
  .mockName("github-api.getPrNumber");
