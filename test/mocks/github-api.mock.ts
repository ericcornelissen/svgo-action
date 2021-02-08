import { Octokit } from "@octokit/core";

import * as github from "./@actions/github.mock";

import { COMMIT_MODE_FILE, COMMIT_TYPE_BLOB } from "../../src/constants";
import { GitFileData, GitObjectInfo } from "../../src/types";


async function _getContent(
  client: Octokit,
  path: string,
  ref = "heads/ref",
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


export const commitFiles = jest.fn()
  .mockImplementation(async () => ({
    sha: "b7d615e1cc52b25023c4bd1cbad1a2ce246009cd",
    url: "https://github.com/ericcornelissen/svgo-action/commit/b7d615e1cc52b25023c4bd1cbad1a2ce246009cd",
  }))
  .mockName("github-api.commitFiles");

export const createBlob = jest.fn()
  .mockImplementation(async (_, path) => ({
    path: path,
    mode: COMMIT_MODE_FILE,
    type: COMMIT_TYPE_BLOB,
    sha: "8cef761674c705447f0ce449948ac6c0dd76f041",
  }))
  .mockName("github-api.createBlob");

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
