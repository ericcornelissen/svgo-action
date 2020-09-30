import * as core from "@actions/core";
import { Octokit } from "@octokit/core";

import { getContent, getDefaultBranch } from "../github-api";
import { ActionConfig } from "../inputs";
import { SVGOptimizer } from "../svgo";
import { ContextData, GitFileInfo, GitObjectInfo } from "../types";
import {
  getCommitData,
  doCommit,
  doFilterSvgsFromFiles,
  doOptimizeSvgs,
} from "./common";


const OBJECT_TYPE_DIR = "dir";
const OBJECT_TYPE_FILE = "file";

function dirObject(objectInfo: GitObjectInfo): boolean {
  return objectInfo.type === OBJECT_TYPE_DIR;
}

function fileObject(objectInfo: GitObjectInfo): boolean {
  return objectInfo.type === OBJECT_TYPE_FILE;
}

async function getHeadRef(client: Octokit): Promise<string> {
  const defaultBranch = await getDefaultBranch(client);
  return `heads/${defaultBranch}`;
}

async function getFilesInRepo(client: Octokit): Promise<GitFileInfo[]> {
  const files: GitFileInfo[] = [];

  const paths: string[] = [""];
  while (paths.length > 0) {
    const path: string = paths.shift() || "";
    const items: GitObjectInfo[] = await getContent(client, path);

    const dirs = items.filter(dirObject).map((item) => item.path);
    paths.push(...dirs);

    const dirFiles = items.filter(fileObject);
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
}
