import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";

import { DISABLE_PATTERN } from "./constants";
import { getCommitFiles } from "./github-api";
import { doFilterSvgsFromFiles, doOptimizeAndCommit } from "./helpers";
import { ActionConfig } from "./inputs";
import { SVGOptimizer } from "./svgo";
import { ContextInfo, GitFileInfo } from "./types";


function getHeadRef(): string {
  return github.context.payload.ref.replace("refs/", "");
}

function isDisabledForCommit(commitMessage: string): boolean {
  return DISABLE_PATTERN.test(commitMessage);
}

async function getFilesInCommits(client: Octokit): Promise<GitFileInfo[]> {
  const commitsFiles: GitFileInfo[] = [];

  const commits = github.context.payload?.commits;
  for (const commit of commits) {
    const commitMessage: string = commit.message;
    if (isDisabledForCommit(commitMessage)) {
      continue;
    }

    const commitId: string = commit.id;
    const commitFiles: GitFileInfo[] = await getCommitFiles(client, commitId);
    commitsFiles.push(...commitFiles);
  }

  return commitsFiles; // TODO: filter duplicates
}

async function getSvgsInCommits(
  client: Octokit,
  ignoreGlob: string,
): Promise<ContextInfo> {
  core.debug("fetching changed files for pushed commits");
  const files: GitFileInfo[] = await getFilesInCommits(client);
  return doFilterSvgsFromFiles(client, files, ignoreGlob);
}


export default async function main(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  const context: ContextInfo = await getSvgsInCommits(
    client,
    config.ignoreGlob,
  );

  await doOptimizeAndCommit(client, getHeadRef(), config, svgo, context);
}
