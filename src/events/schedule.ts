import * as core from "@actions/core";
import { Octokit } from "@octokit/core";

import {
  GIT_OBJECT_TYPE_DIR,
  GIT_OBJECT_TYPE_FILE,
  OUTPUT_NAME_DID_OPTIMIZE,
  OUTPUT_NAME_OPTIMIZED_COUNT,
  OUTPUT_NAME_SKIPPED_COUNT,
  OUTPUT_NAME_SVG_COUNT,
  STATUS_EXISTS,
} from "../constants";
import { getContent, getDefaultBranch } from "../github-api";
import { ActionConfig } from "../inputs";
import { SVGOptimizer } from "../svgo";
import { ContextData, GitFileInfo, GitObjectInfo, OutputName } from "../types";
import {
  getCommitData,
  doCommit,
  doFilterSvgsFromFiles,
  doOptimizeSvgs,
  setOutputValues,
} from "./common";


const OUTPUT_NAMES: OutputName[] = [
  OUTPUT_NAME_DID_OPTIMIZE,
  OUTPUT_NAME_OPTIMIZED_COUNT,
  OUTPUT_NAME_SKIPPED_COUNT,
  OUTPUT_NAME_SVG_COUNT,
];

function dirObject(objectInfo: GitObjectInfo): boolean {
  return objectInfo.type === GIT_OBJECT_TYPE_DIR;
}

function fileObject(objectInfo: GitObjectInfo): boolean {
  return objectInfo.type === GIT_OBJECT_TYPE_FILE;
}

async function getHeadRef(
  client: Octokit,
  config: ActionConfig,
): Promise<string> {
  const branchName = config.branch || await getDefaultBranch(client);
  return `heads/${branchName}`;
}

function objectInfoToFileInfo(objectInfo: GitObjectInfo): GitFileInfo {
  return {
    path: objectInfo.path,
    status: STATUS_EXISTS,
  };
}

async function getFilesInRepo(
  client: Octokit,
  ref: string,
): Promise<GitFileInfo[]> {
  const files: GitFileInfo[] = [];

  const paths: string[] = [""];
  while (paths.length > 0) {
    const path: string = paths.shift() || "";
    const items: GitObjectInfo[] = await getContent(client, ref, path);

    const dirs = items.filter(dirObject).map((item) => item.path);
    paths.push(...dirs);

    const dirFiles= items.filter(fileObject).map(objectInfoToFileInfo);
    files.push(...dirFiles);
  }

  return files;
}

async function getSvgsInRepo(
  client: Octokit,
  ref: string,
  ignoreGlob: string,
): Promise<ContextData> {
  core.debug("fetching files in repository");
  const files: GitFileInfo[] = await getFilesInRepo(client, ref);
  return doFilterSvgsFromFiles(client, ref, files, ignoreGlob);
}


export default async function main(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  const ref = await getHeadRef(client, config);
  const context = await getSvgsInRepo(client, ref, config.ignoreGlob);
  const optimizedSvgs = await doOptimizeSvgs(svgo, context.svgs);
  const commitData = getCommitData(context, optimizedSvgs);
  await doCommit(client, ref, config, commitData);
  setOutputValues(commitData, OUTPUT_NAMES);
}
