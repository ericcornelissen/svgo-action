import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";

import { DISABLE_PATTERN, ENABLE_PATTERN, PR_NOT_FOUND } from "../constants";
import {
  createComment,
  getCommitMessage,
  getPrComments,
  getPrFiles,
  getPrNumber,
} from "../github-api";
import { doCommit, doFilterSvgsFromFiles, doOptimizeSvgs } from "../helpers";
import { ActionConfig } from "../inputs";
import { SVGOptimizer } from "../svgo";
import { formatComment } from "../templating";
import { ContextInfo, CommitData, GitFileInfo } from "../types";


function getHeadRef(): string {
  const head: string = github.context.payload.pull_request?.head.ref;
  return `heads/${head}`;
}

async function actionDisabledFromPR(
  client: Octokit,
  prNumber: number,
): Promise<boolean> {
  const prComments: string[] = await getPrComments(client, prNumber);
  for (const comment of prComments) {
    if (ENABLE_PATTERN.test(comment)) {
      break;
    } else if (DISABLE_PATTERN.test(comment)) {
      return true;
    }
  }

  return false;
}

async function actionDisabled(
  client: Octokit,
  prNumber: number,
): Promise<{ isDisabled: boolean; disabledFrom: string }> {
  const commitMessage: string = await getCommitMessage(client, getHeadRef());
  if (DISABLE_PATTERN.test(commitMessage)) {
    return { isDisabled: true, disabledFrom: "commit message" };
  }

  if (!ENABLE_PATTERN.test(commitMessage)) {
    const disabledFromPR = await actionDisabledFromPR(client, prNumber);
    if (disabledFromPR) {
      return { isDisabled: true, disabledFrom: "Pull Request" };
    }
  }

  return { isDisabled: false, disabledFrom: "" };
}

async function getSvgsInPR(
  client: Octokit,
  prNumber: number,
  ignoreGlob: string,
): Promise<ContextInfo> {
  core.debug(`fetching changed files for pull request #${prNumber}`);
  const prFiles: GitFileInfo[] = await getPrFiles(client, prNumber);
  return doFilterSvgsFromFiles(client, prFiles, ignoreGlob);
}

async function run(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
  prNumber: number,
): Promise<void> {
  const { fileCount, svgs, ignoredCount } = await getSvgsInPR(
    client,
    prNumber,
    config.ignoreGlob,
  );

  core.info(`Found ${svgs.length} SVG(s) in Pull Request, optimizing...`);
  const optimizedSvgs = await doOptimizeSvgs(svgo, svgs);

  const commitData: CommitData = {
    fileCount: fileCount,
    fileData: { optimized: optimizedSvgs, original: svgs },
    ignoredCount: ignoredCount,
    optimizedCount: optimizedSvgs.length,
    skippedCount: svgs.length - optimizedSvgs.length,
    svgCount: svgs.length,
  };

  await doCommit(client, getHeadRef(), config, commitData);
  if (config.enableComments && commitData.optimizedCount > 0) {
    core.debug(`creating comment on pull request #${prNumber}`);
    const comment: string = formatComment(config.comment, commitData);
    await createComment(client, prNumber, comment);
  }
}


export default async function main(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  const prNumber: number = getPrNumber();
  if (prNumber === PR_NOT_FOUND) {
    throw new Error("Could not get Pull Request number from context");
  }

  const { isDisabled, disabledFrom } = await actionDisabled(client, prNumber);
  if (isDisabled) {
    core.info(`Action disabled from ${disabledFrom}, exiting`);
  } else {
    await run(client, config, svgo, prNumber);
  }
}
