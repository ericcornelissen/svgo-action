import { Octokit } from "@octokit/core";

import * as github from "./@actions/github.mock";

import { GitFileData, GitObjectInfo } from "../../src/types";


async function _getContent(
  client: Octokit,
  ref,
  path: string,
): Promise<GitFileData | GitObjectInfo[]> {
  const { data } = await client.repos.getContent({
    owner: "mew",
    repo: "svg-action",
    path,
    ref,
  });

  if (Array.isArray(data)) {
    return data.map((item) => ({
      path: item.path,
      type: item.type,
    }));
  } else {
    return {
      path: data.path,
      content: data.content,
      encoding: data.encoding,
    };
  }
}


export const createComment = jest.fn()
  .mockName("github-api.createComment");

export const getCommitFiles = jest.fn()
  .mockImplementation(async (client, sha) => {
    const { data } = await client.repos.getCommit({
      owner: "mew",
      repo: "svg-action",
      ref: sha,
    });

    return data.files.map((details) => ({
      path: details.filename,
      status: details.status,
    }));
  })
  .mockName("github-api.getCommitFiles");

export const getCommitMessage = jest.fn()
  .mockResolvedValue("This is a commit message")
  .mockName("github-api.getCommitMessage");

export const getContent = jest.fn()
  .mockImplementation(_getContent)
  .mockName("github-api.getContent");

export const getDefaultBranch = jest.fn()
  .mockReturnValue("main")
  .mockName("github-api.getDefaultBranch");

export const getFile = jest.fn()
  .mockImplementation(_getContent)
  .mockName("github-api.getFile");

export const getPrComments = jest.fn()
  .mockResolvedValue([])
  .mockName("github-api.getPrComment");

export const getPrFiles = jest.fn()
  .mockImplementation(async (client, prNumber) => {
    const { data } = await client.pulls.listFiles({
      owner: "mew",
      repo: "svg-action",
      pull_number: prNumber,
    });

    return data.map((details) => ({
      path: details.filename,
      status: details.status,
    }));
  })
  .mockName("github-api.getPrFiles");

export const getPrNumber = jest.fn()
  .mockReturnValue(github.PR_NUMBER.NO_CHANGES)
  .mockName("github-api.getPrNumber");
