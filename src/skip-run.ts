import type { Context } from "@actions/github/lib/context";
import type { Octokit } from "@octokit/core";

import { EVENT_PULL_REQUEST, EVENT_PUSH } from "./constants";
import { getCommitMessage, getPrComments, getPrNumber } from "./github-api";


const DISABLE_PATTERN = /disable-svgo-action/;
const ENABLE_PATTERN = /enable-svgo-action/;

async function actionDisabledFromPR(
  client: Octokit,
  context: Context,
  prNumber: number,
): Promise<boolean> {
  const prComments: string[] = await getPrComments(client, context, prNumber);
  for (const comment of prComments) {
    if (ENABLE_PATTERN.test(comment)) {
      break;
    } else if (DISABLE_PATTERN.test(comment)) {
      return true;
    }
  }

  return false;
}

async function checkShouldSkipPullRequest(
  client: Octokit,
  context: Context,
): Promise<{ shouldSkip: boolean, reason: string }> {
  let commitMessage = "";
  if (context.payload.pull_request) {
    const commitRef = `heads/${context.payload.pull_request.head.ref}`;
    commitMessage = await getCommitMessage(client, context, commitRef);
  }

  if (DISABLE_PATTERN.test(commitMessage)) {
    return { shouldSkip: true, reason: "commit message" };
  }

  if (!ENABLE_PATTERN.test(commitMessage)) {
    const prNumber = getPrNumber(context);
    const disabled = await actionDisabledFromPR(client, context, prNumber);
    if (disabled) {
      return { shouldSkip: true, reason: "Pull Request" };
    }
  }

  return { shouldSkip: false, reason: "" };
}

async function checkShouldSkipPush(
  context: Context,
): Promise<{ shouldSkip: boolean, reason: string }> {
  const commits = context.payload.commits;
  if (commits.length > 0) {
    const commitMessage = commits[0].message;
    if (DISABLE_PATTERN.test(commitMessage)) {
      return { shouldSkip: true, reason: "commit message" };
    }
  }

  return { shouldSkip: false, reason: "" };
}


export async function shouldSkipRun(
  client: Octokit,
  context: Context,
): Promise<{ shouldSkip: boolean, reason: string }> {
  switch (context.eventName) {
    case EVENT_PULL_REQUEST:
      return await checkShouldSkipPullRequest(client, context);
    case EVENT_PUSH:
      return await checkShouldSkipPush(context);
    default:
      return { shouldSkip: false, reason: "" };
  }
}
