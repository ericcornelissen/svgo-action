import type { Octokit } from "@octokit/core";
import type { GitGetCommitResponseData } from "@octokit/types";

import * as github from "@actions/github";

import { PR_NOT_FOUND } from "./constants";


type GitCommit = GitGetCommitResponseData;

const owner = github.context.repo.owner;
const repo = github.context.repo.repo;

async function getCommitAt(client: Octokit, ref: string): Promise<GitCommit> {
  const { data: refData } = await client.git.getRef({ owner, repo, ref });
  const { data: commit } = await client.git.getCommit({ owner, repo,
    commit_sha: refData.object.sha,
  });

  return commit;
}


export async function createComment(
  client: Octokit,
  prNumber: number,
  comment: string,
): Promise<void> {
  await client.issues.createComment({ owner, repo,
    issue_number: prNumber,
    body: comment,
  });
}

export async function getCommitMessage(
  client: Octokit,
  ref: string,
): Promise<string> {
  const { message } = await getCommitAt(client, ref);
  return message;
}

export async function getPrComments(
  client: Octokit,
  prNumber: number,
): Promise<string[]> {
  const PER_PAGE = 100;

  const { data } = await client.pulls.get({ owner, repo,
    pull_number: prNumber,
  });

  const prComments: string[] = [];
  for (let i = 0; i < Math.ceil(data.comments / PER_PAGE); i++) {
    const { data: comments } = await client.issues.listComments({ owner, repo,
      issue_number: prNumber,
      per_page: PER_PAGE,
      page: i,
    });

    prComments.push(...comments.map((comment) => comment.body));
  }

  return prComments.reverse();
}

export function getPrNumber(): number {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return PR_NOT_FOUND;
  }

  return pullRequest.number;
}
