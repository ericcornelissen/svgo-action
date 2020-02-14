import * as github from "@actions/github";


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

function getHead(): string {
  return github.context.payload.pull_request?.head.ref;
}


export const PR_NOT_FOUND = -1;


export interface CommitInfo {
  readonly sha: string;
  readonly url: string;
}

export interface FileInfo {
  readonly path: string;
  readonly status: string;
}

export interface FileData {
  readonly path: string;
  readonly content: string;
  readonly encoding: string;
}


export async function commit(
  client: github.GitHub,
  path: string,
  data: string,
  encoding: string,
  commitMessage: string
): Promise<CommitInfo> {
  const MODE = "100644";
  const TYPE = "blob";

  const ref = `heads/${getHead()}`;

  const { data: refData } = await client.git.getRef({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: ref,
  });

  const { data: previousCommit } = await client.git.getCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    commit_sha: refData.object.sha, /* eslint-disable-line @typescript-eslint/camelcase */
  });

  const { data: fileBlob } = await client.git.createBlob({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    content: data,
    encoding: encoding,
  });

  const { data: newTree } = await client.git.createTree({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    base_tree: previousCommit.tree.sha, /* eslint-disable-line @typescript-eslint/camelcase */
    tree: [
      {
        path: path,
        mode: MODE,
        type: TYPE,
        sha: fileBlob.sha,
      },
    ],
  });

  const { data: newCommit } = await client.git.createCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    message: commitMessage,
    tree: newTree.sha,
    parents: [refData.object.sha],
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

export async function getPrFile(
  client: github.GitHub,
  path: string
): Promise<FileData> {
  const fileContents = await client.repos.getContents({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: path,
    ref: github.context.sha,
  });

  const fileDetails = fileContents.data[0] || fileContents.data;
  return {
    path: fileDetails.path,
    content: fileDetails.content,
    encoding: fileDetails.encoding,
  };
}

export async function getPrFiles(
  client: github.GitHub,
  prNumber: number
): Promise<FileInfo[]> {
  const prFilesDetails = await client.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber, /* eslint-disable-line @typescript-eslint/camelcase */
  });

  return prFilesDetails.data.map(details => ({
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
