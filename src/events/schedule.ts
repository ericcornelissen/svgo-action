import * as core from "@actions/core";
import { Octokit } from "@octokit/core";

import {
  GIT_OBJECT_TYPE_DIR,
  GIT_OBJECT_TYPE_FILE,
  STATUS_EXISTS,
  OUTPUT_NAME_DID_OPTIMIZE,
  OUTPUT_NAME_OPTIMIZED_COUNT,
  OUTPUT_NAME_SKIPPED_COUNT,
  OUTPUT_NAME_SVG_COUNT,
} from "../constants";
import { getContent, getDefaultBranch } from "../github-api";
import { ActionConfig } from "../inputs";
import { SVGOptimizer } from "../svgo";
import { CommitData, ContextData, GitFileInfo, GitObjectInfo } from "../types";
import {
  getCommitData,
  doCommit,
  doFilterSvgsFromFiles,
  doOptimizeSvgs,
} from "./common";


function dirObject(objectInfo: GitObjectInfo): boolean {
  return objectInfo.type === GIT_OBJECT_TYPE_DIR;
}

function fileObject(objectInfo: GitObjectInfo): boolean {
  return objectInfo.type === GIT_OBJECT_TYPE_FILE;
}

async function getHeadRef(client: Octokit): Promise<string> {
  const defaultBranch = await getDefaultBranch(client);
  return `heads/${defaultBranch}`;
}

function objectInfoToFileInfo(objectInfo: GitObjectInfo): GitFileInfo {
  return {
    path: objectInfo.path,
    status: STATUS_EXISTS,
  };
}

async function getFilesInRepo(client: Octokit): Promise<GitFileInfo[]> {
  const files: GitFileInfo[] = [];

  const paths: string[] = [""];
  while (paths.length > 0) {
    const path: string = paths.shift() || "";
    const items: GitObjectInfo[] = await getContent(client, path);

    const dirs = items.filter(dirObject).map((item) => item.path);
    paths.push(...dirs);

    const dirFiles= items.filter(fileObject).map(objectInfoToFileInfo);
    files.push(...dirFiles);
  }

  return files;
}

async function getSvgsInRepo(
  client: Octokit,
  ignoreGlob: string,
): Promise<ContextData> {
  core.debug("fetching files in repository");
  const files: GitFileInfo[] = await getFilesInRepo(client);
  return doFilterSvgsFromFiles(client, files, ignoreGlob);
}

function setOutputValues(commitData: CommitData): void {
  core.setOutput(OUTPUT_NAME_DID_OPTIMIZE, `${commitData.optimizedCount > 0}`);
  core.setOutput(OUTPUT_NAME_OPTIMIZED_COUNT, `${commitData.optimizedCount}`);
  core.setOutput(OUTPUT_NAME_SKIPPED_COUNT, `${commitData.skippedCount}`);
  core.setOutput(OUTPUT_NAME_SVG_COUNT, `${commitData.svgCount}`);
}


export default async function main(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  const context = await getSvgsInRepo(client, config.ignoreGlob);
  const optimizedSvgs = await doOptimizeSvgs(svgo, context.svgs);
  const commitData = getCommitData(context, optimizedSvgs);
  const ref = await getHeadRef(client);
  await doCommit(client, ref, config, commitData);
  setOutputValues(commitData);
}
