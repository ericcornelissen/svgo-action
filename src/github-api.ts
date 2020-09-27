import * as github from "@actions/github";
import { Octokit } from "@octokit/core";
import { GitGetCommitResponseData } from "@octokit/types";

import {
  COMMIT_MODE_FILE,
  COMMIT_TYPE_BLOB,
  PR_NOT_FOUND,
  STATUS_ADDED,
} from "./constants";
import {
  CommitInfo,
  GitBlob,
  GitFileData,
  GitFileInfo,
  GitObjectInfo,
} from "./types";


type GitCommit = GitGetCommitResponseData;


async function getCommitAt(client: Octokit, ref: string): Promise<GitCommit> {
  const { data: refData } = await client.git.getRef({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: ref,
  });

  const { data: commit } = await client.git.getCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    commit_sha: refData.object.sha,
  });

  return commit;
}

function getCommitUrl(commitSha: string): string {
  if (github.context.payload.repository === undefined) {
    return commitSha;
  }

  // https://github.com/{user}/{repo}
  const baseRepoUrl = github.context.payload.repository?.url;
  // https://github.com/{user}/{repo}/git/commit
  const baseCommitUrl = `${baseRepoUrl}/git/commit`;
  // https://github.com/{user}/{repo}/git/commit/{commitSha}
  return `${baseCommitUrl}/${commitSha}`;
}


export async function commitFiles(
  client: Octokit,
  blobs: GitBlob[],
  ref: string,
  commitMessage: string,
): Promise<CommitInfo> {
  const previousCommit = await getCommitAt(client, ref);

  const { data: newTree } = await client.git.createTree({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    base_tree: previousCommit.tree.sha,
    tree: blobs,
  });

  const { data: newCommit } = await client.git.createCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    message: commitMessage,
    tree: newTree.sha,
    parents: [previousCommit.sha],
  });

  const { data: result } = await client.git.updateRef({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: ref,
    sha: newCommit.sha,
  });

  return {
    sha: result.object.sha,
    url: getCommitUrl(result.object.sha),
  };
}

export async function createBlob(
  client: Octokit,
  path: string,
  data: string,
  encoding: string,
): Promise<GitBlob> {
  const { data: fileBlob } = await client.git.createBlob({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    content: data,
    encoding: encoding,
  });

  return {
    mode: COMMIT_MODE_FILE,
    path: path,
    sha: fileBlob.sha,
    type: COMMIT_TYPE_BLOB,
  };
}

export async function createComment(
  client: Octokit,
  prNumber: number,
  comment: string,
): Promise<void> {
  await client.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber,
    body: comment,
  });
}

export async function getCommitFiles(
  client: Octokit,
  sha: string,
): Promise<GitFileInfo[]> {
  const { data } = await client.repos.getCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: sha,
  });

  return data.files.map((details) => ({
    path: details.filename,
    status: details.status,
  }));
}

export async function getCommitMessage(
  client: Octokit,
  ref: string,
): Promise<string> {
  const { message } = await getCommitAt(client, ref);
  return message;
}

export async function getContent(
  client: Octokit,
  path: string,
): Promise<GitObjectInfo[]> {
  const { data } = await client.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: path,
    ref: github.context.sha,
  });

  return data.map((item) => ({
    path: item.path,
    status: STATUS_ADDED,
    type: item.type,
  }));

}

export async function getDefaultBranch(client: Octokit): Promise<string> {
  const { data } = await client.repos.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
  });

  return data.default_branch;
}

export async function getPrComments(
  client: Octokit,
  prNumber: number,
): Promise<string[]> {
  const PER_PAGE = 100;

  const { data } = await client.pulls.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
  });

  const prComments: string[] = [];
  for (let i = 0; i < Math.ceil(data.comments / PER_PAGE); i++) {
    const { data: comments } = await client.issues.listComments({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prNumber,
      per_page: PER_PAGE,
      page: i,
    });

    prComments.push(...comments.map((comment) => comment.body));
  }

  return prComments.reverse();
}

export async function getPrFile(
  client: Octokit,
  path: string,
): Promise<GitFileData> {
  const fileContents = await client.repos.getContent({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: path,
    ref: github.context.sha,
  });

  const fileDetails = fileContents.data[0] || fileContents.data;
  return {
    content: fileDetails.content,
    encoding: fileDetails.encoding,
    path: fileDetails.path,
  };
}

export async function getPrFiles(
  client: Octokit,
  prNumber: number,
): Promise<GitFileInfo[]> {
  const prFilesDetails = await client.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
  });

  return prFilesDetails.data.map((details) => ({
    path: details.filename,
    status: details.status,
  }));
}

export function getPrNumber(): number {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return PR_NOT_FOUND;
  }

  return pullRequest.number;
}

export async function getRepoFile(
  client: Octokit,
  path: string,
): Promise<GitFileData> {
  return await getPrFile(client, path);
}
