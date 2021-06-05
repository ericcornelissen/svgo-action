import * as github from "@actions/github";

import { COMMIT_MODE_FILE, COMMIT_TYPE_BLOB, PR_NOT_FOUND } from "./constants";
import {
  CommitInfo,
  GitBlob,
  GitFileData,
  GitFileInfo,
  GitObjectInfo,
  Octokit,
} from "./types";


type FileContents = {
  content: string;
  encoding: string;
  path: string;
  type: string;
};

type DirContents = FileContents[];

type GitCommit = {
  message: string;
  sha: string;
  tree: {
    sha: string;
  };
};

type RepoContents = FileContents | DirContents;


const owner = github.context.repo.owner;
const repo = github.context.repo.repo;

async function getCommitAt(client: Octokit, ref: string): Promise<GitCommit> {
  const { data: refData } = await client.rest.git.getRef({ owner, repo, ref });
  const { data: commit } = await client.rest.git.getCommit({ owner, repo,
    commit_sha: refData.object.sha,
  });

  return commit;
}

async function getContentFromRepo(
  client: Octokit,
  ref: string,
  path: string,
): Promise<RepoContents> {
  const { data } = await client.rest.repos.getContent({
    owner,
    repo,
    path,
    ref,
  });

  return data as RepoContents;
}


export async function commitFiles(
  client: Octokit,
  blobs: GitBlob[],
  ref: string,
  commitMessage: string,
): Promise<CommitInfo> {
  const previousCommit = await getCommitAt(client, ref);

  const { data: newTree } = await client.rest.git.createTree({ owner, repo,
    base_tree: previousCommit.tree.sha,
    tree: blobs,
  });

  const { data: newCommit } = await client.rest.git.createCommit({ owner, repo,
    message: commitMessage,
    tree: newTree.sha,
    parents: [previousCommit.sha],
  });

  const { data: result } = await client.rest.git.updateRef({ owner, repo, ref,
    sha: newCommit.sha,
  });

  return {
    sha: result.object.sha,
    url: `https://github.com/${owner}/${repo}/git/commit/${result.object.sha}`,
  };
}

export async function createBlob(
  client: Octokit,
  path: string,
  data: string,
  encoding: string,
): Promise<GitBlob> {
  const { data: fileBlob } = await client.rest.git.createBlob({ owner, repo,
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
  await client.rest.issues.createComment({ owner, repo,
    issue_number: prNumber,
    body: comment,
  });
}

export async function getCommitFiles(
  client: Octokit,
  sha: string,
): Promise<GitFileInfo[]> {
  const { data } = await client.rest.repos.getCommit({ owner, repo,
    ref: sha,
  });

  return (data.files || []).map((details) => ({
    path: details.filename || "",
    status: details.status || "",
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
  ref: string,
  path: string,
): Promise<GitObjectInfo[]> {
  const data = await getContentFromRepo(client, ref, path) as DirContents;
  return data.map((item) => ({
    path: item.path,
    type: item.type,
  }));
}

export async function getDefaultBranch(client: Octokit): Promise<string> {
  const { data } = await client.rest.repos.get({ owner, repo });
  return data.default_branch;
}

export async function getFile(
  client: Octokit,
  ref: string,
  path: string,
): Promise<GitFileData> {
  const contents = await getContentFromRepo(client, ref, path) as FileContents;
  return {
    content: contents.content,
    encoding: contents.encoding,
    path: contents.path,
  };
}

export async function getPrComments(
  client: Octokit,
  prNumber: number,
): Promise<string[]> {
  const PER_PAGE = 100;

  const { data } = await client.rest.pulls.get({ owner, repo,
    pull_number: prNumber,
  });

  const prComments: string[] = [];
  for (let i = 0; i < Math.ceil(data.comments / PER_PAGE); i++) {
    const { data: comments } = await client.rest.issues.listComments({
      owner,
      repo,
      issue_number: prNumber,
      per_page: PER_PAGE,
      page: i,
    });

    prComments.push(...comments.map((comment) => comment.body || ""));
  }

  return prComments.reverse();
}

export async function getPrFiles(
  client: Octokit,
  prNumber: number,
): Promise<GitFileInfo[]> {
  const prFilesDetails = await client.rest.pulls.listFiles({ owner, repo,
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
