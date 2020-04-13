import * as github from "@actions/github";
import { Octokit } from "@octokit/rest";

import { COMMIT_MODE_FILE, COMMIT_TYPE_BLOB, PR_NOT_FOUND } from "./constants";
import { CommitInfo, GitBlob, GitFileData, GitFileInfo } from "./types";


type GitCommit = Octokit.GitGetCommitResponse;


function getHead(): string {
  return github.context.payload.pull_request?.head.ref;
}

async function getCommit(client: github.GitHub): Promise<GitCommit> {
  const ref = `heads/${getHead()}`;

  const { data: refData } = await client.git.getRef({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: ref,
  });

  const { data: commit } = await client.git.getCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    commit_sha: refData.object.sha, // eslint-disable-line @typescript-eslint/camelcase
  });

  return commit;
}

function getCommitUrl(commitSha: string): string {
  const API_URL_START = "https://api.github.com/repos/";
  const SITE_URL_START = "https://github.com/";
  const API_URL_END = "/commits{/sha}";
  const SITE_URL_END = "/commit";

  // https://api.github.com/repos/{user}/{repo}/git/commits{/sha}
  const apiCommitsUrl: string = github.context.payload.repository?.commits_url;

  // https://github.com/{user}/{repo}/git/commits{/sha}
  const mixedUrl: string = apiCommitsUrl.replace(API_URL_START, SITE_URL_START);

  // https://github.com/{user}/{repo}/git/commit
  const baseCommitUrl: string = mixedUrl.replace(API_URL_END, SITE_URL_END);

  // https://github.com/{user}/{repo}/git/commit/{commitSha}
  return `${baseCommitUrl}/${commitSha}`;
}


export async function commitFiles(
  client: github.GitHub,
  blobs: GitBlob[],
  commitMessage: string,
): Promise<CommitInfo> {
  const ref = `heads/${getHead()}`;
  const previousCommit = await getCommit(client);

  const { data: newTree } = await client.git.createTree({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    base_tree: previousCommit.tree.sha, // eslint-disable-line @typescript-eslint/camelcase
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
  client: github.GitHub,
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
  client: github.GitHub,
  prNumber: number,
  comment: string,
): Promise<void> {
  await client.issues.createComment({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    issue_number: prNumber, // eslint-disable-line @typescript-eslint/camelcase
    body: comment,
  });
}

export async function getCommitMessage(client: github.GitHub): Promise<string> {
  const { message } = await getCommit(client);
  return message;
}

export async function getPrComments(
  client: github.GitHub,
  prNumber: number,
): Promise<string[]> {
  const PER_PAGE = 100;

  const { data } = await client.pulls.get({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber, // eslint-disable-line @typescript-eslint/camelcase
  });

  const prComments: string[] = [];
  for (let i = 0; i < Math.ceil(data.comments / PER_PAGE); i++) {
    const { data: comments } = await client.issues.listComments({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      issue_number: prNumber, // eslint-disable-line @typescript-eslint/camelcase
      per_page: PER_PAGE, // eslint-disable-line @typescript-eslint/camelcase
      page: i,
    });

    prComments.push(...comments.map((comment) => comment.body));
  }

  return prComments.reverse();
}

export async function getPrFile(
  client: github.GitHub,
  path: string,
): Promise<GitFileData> {
  const fileContents = await client.repos.getContents({
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
  client: github.GitHub,
  prNumber: number,
): Promise<GitFileInfo[]> {
  const prFilesDetails = await client.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber, // eslint-disable-line @typescript-eslint/camelcase
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
  client: github.GitHub,
  path: string,
): Promise<GitFileData> {
  return await getPrFile(client, path);
}
