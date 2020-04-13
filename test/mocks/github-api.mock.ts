import * as github from "./@actions/github.mock";

import { COMMIT_MODE_FILE, COMMIT_TYPE_BLOB } from "../../src/constants";
import { GitFileData } from "../../src/types";


const client = new github.GitHub();

async function getContents(path: string): Promise<GitFileData> {
  const { data } = await client.repos.getContents({ path });
  return {
    path: data.path,
    content: data.content,
    encoding: data.encoding,
  };
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

export const getCommitMessage = jest.fn()
  .mockResolvedValue("This is a commit message")
  .mockName("github-api.getCommitMessage");

export const getPrComments = jest.fn()
  .mockResolvedValue([])
  .mockName("github-api.getPrFile");

export const getPrFile = jest.fn()
  .mockImplementation(async (_, path) => await getContents(path))
  .mockName("github-api.getPrFile");

export const getPrFiles = jest.fn()
  .mockImplementation(async (_, prNumber) => {
    const { data } = await client.pulls.listFiles({
      pull_number: prNumber, // eslint-disable-line @typescript-eslint/camelcase
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

export const getRepoFile = jest.fn()
  .mockImplementation(async (_, path) => await getContents(path))
  .mockName("github-api.getPrFile");
