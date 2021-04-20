import type { Context } from "@actions/github/lib/context";
import type { Octokit } from "@octokit/core";
import type { GitGetCommitResponseData } from "@octokit/types";

import { PR_NOT_FOUND } from "./constants";

async function getCommitAt(
  client: Octokit,
  context: Context,
  ref: string,
): Promise<GitGetCommitResponseData> {
  const { data: refData } = await client.git.getRef({
    owner: context.repo.owner,
    repo: context.repo.repo,
    ref,
  });

  const { data: commit } = await client.git.getCommit({
    owner: context.repo.owner,
    repo: context.repo.repo,
    commit_sha: refData.object.sha,
  });

  return commit;
}

export async function createComment(
  client: Octokit,
  context: Context,
  prNumber: number,
  comment: string,
): Promise<void> {
  await client.issues.createComment({
    owner: context.repo.owner,
    repo: context.repo.repo,
    issue_number: prNumber,
    body: comment,
  });
}

export async function getCommitMessage(
  client: Octokit,
  context: Context,
  ref: string,
): Promise<string> {
  const { message } = await getCommitAt(client, context, ref);
  return message;
}

export async function getPrComments(
  client: Octokit,
  context: Context,
  prNumber: number,
): Promise<string[]> {
  const PER_PAGE = 100;

  const { data } = await client.pulls.get({
    owner: context.repo.owner,
    repo: context.repo.repo,
    pull_number: prNumber,
  });

  const prComments: string[] = [];
  for (let i = 0; i < Math.ceil(data.comments / PER_PAGE); i++) {
    const { data: comments } = await client.issues.listComments({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: prNumber,
      per_page: PER_PAGE,
      page: i,
    });

    prComments.push(...comments.map((comment) => comment.body));
  }

  return prComments.reverse();
}

export function getPrNumber(context: Context): number {
  const pullRequest = context.payload.pull_request;
  if (!pullRequest) {
    return PR_NOT_FOUND;
  }

  return pullRequest.number;
}
