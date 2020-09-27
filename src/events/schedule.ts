import * as core from "@actions/core";
import { Octokit } from "@octokit/core";

import { ActionConfig } from "../inputs";
import { SVGOptimizer } from "../svgo";
import { ContextData, GitFileInfo } from "../types";
import {
  getCommitData,
  doCommit,
  doFilterSvgsFromFiles,
  doOptimizeSvgs,
} from "./helpers";


function getDefaultRef(): string {
  return "master";
}

async function getSvgsInRepo(
  client: Octokit,
  ignoreGlob: string,
): Promise<ContextData> {
  core.debug("fetching changed files for pushed commits");
  const files: GitFileInfo[] = [];
  return doFilterSvgsFromFiles(client, files, ignoreGlob);
}


export default async function main(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  const context = await getSvgsInRepo(client, config.ignoreGlob);
  const optimizedSvgs = await doOptimizeSvgs(svgo, context.svgs);
  const commitData = getCommitData(context, optimizedSvgs);
  await doCommit(client, getDefaultRef(), config, commitData);
}
