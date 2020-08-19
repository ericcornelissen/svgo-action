import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";

import { DISABLE_PATTERN } from "./constants";
import { decode, encode } from "./encoder";
import { existingFiles, filesNotMatching, svgFiles } from "./filters";
import {
  commitFiles,
  createBlob,
  getCommitFiles,
  getPrFile,
} from "./github-api";
import { ActionConfig } from "./inputs";
import { SVGOptimizer } from "./svgo";
import { formatCommitMessage } from "./templating";
import {
  CommitData,
  FileData,

  // Git
  CommitInfo,
  GitBlob,
  GitFileData,
  GitFileInfo,
} from "./types";


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
): Promise<{
  fileCount: number;
  ignoredCount: number;
  svgCount: number;
  svgs: FileData[];
}> {
  core.debug("fetching changed files for pushed commits");

  const files: GitFileInfo[] = await getFilesInCommits(client);
  const fileCount = files.length;
  core.debug(`the commits contain ${fileCount} file(s)`);

  const svgsInfo: GitFileInfo[] = files.filter(svgFiles).filter(existingFiles);
  const svgCount = svgsInfo.length;
  core.debug(`the commits contain ${svgCount} SVG(s)`);

  const notGlobbedFiles = filesNotMatching(ignoreGlob);
  const notIgnoredSvgs: GitFileInfo[] = svgsInfo.filter(notGlobbedFiles);
  const ignoredCount = svgCount - notIgnoredSvgs.length;
  core.debug(`${ignoredCount} SVG(s) matching '${ignoreGlob}' will be ignored`);

  const svgs: FileData[] = [];
  for (const svg of notIgnoredSvgs) {
    core.debug(`fetching file contents of '${svg.path}'`);
    const fileData: GitFileData = await getPrFile(client, svg.path);

    core.debug(`decoding ${fileData.encoding}-encoded '${svg.path}'`);
    const svgContent: string = decode(fileData.content, fileData.encoding);

    svgs.push({
      content: svgContent,
      originalEncoding: fileData.encoding,
      path: fileData.path,
    });
  }

  return { fileCount, ignoredCount, svgCount, svgs };
}

async function doOptimizeSvgs(
  svgo: SVGOptimizer,
  originalSvgs: FileData[],
): Promise<FileData[]> {
  const optimizedSvgs: FileData[] = [];
  for (const svg of originalSvgs) {
    try {
      core.debug(`optimizing '${svg.path}'`);
      const optimizedSvg: string = await svgo.optimize(svg.content);
      if (svg.content === optimizedSvg) {
        core.debug(`skipping '${svg.path}', already optimized`);
        continue;
      }

      optimizedSvgs.push({
        content: optimizedSvg,
        originalEncoding: svg.originalEncoding,
        path: svg.path,
      });
    } catch (_) {
      core.info(`SVGO cannot optimize '${svg.path}', source incorrect`);
    }
  }

  return optimizedSvgs;
}

async function toBlobs(
  client: Octokit,
  files: FileData[],
): Promise<GitBlob[]> {
  const blobs: GitBlob[] = [];
  for (const file of files) {
    core.debug(`encoding (updated) '${file.path}' to ${file.originalEncoding}`);
    const optimizedData: string = encode(file.content, file.originalEncoding);

    core.debug(`creating blob for (updated) '${file.path}'`);
    const svgBlob: GitBlob = await createBlob(
      client,
      file.path,
      optimizedData,
      file.originalEncoding,
    );

    blobs.push(svgBlob);
  }

  return blobs;
}

async function doCommitChanges(
  client: Octokit,
  config: ActionConfig,
  commitData: CommitData,
): Promise<void> {
  if (!config.isDryRun && commitData.optimizedCount > 0) {
    const blobs: GitBlob[] = await toBlobs(
      client,
      commitData.fileData.optimized,
    );

    const commitMessage: string = formatCommitMessage(
      config.commitTitle,
      config.commitBody,
      commitData,
    );

    core.debug(`committing ${commitData.optimizedCount} updated SVG(s)`);
    const commitInfo: CommitInfo = await commitFiles(
      client,
      blobs,
      getHeadRef(),
      commitMessage,
    );
    core.debug(`commit successful (see ${commitInfo.url})`);
  }
}


export default async function main(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  const { fileCount, ignoredCount, svgCount, svgs } = await getSvgsInCommits(
    client,
    config.ignoreGlob,
  );

  if (svgCount > 0) {
    core.info(`Found ${svgCount}/${fileCount} new or changed SVG(s)`);
    const optimizedSvgs: FileData[] = await doOptimizeSvgs(svgo, svgs);
    const optimizedCount = optimizedSvgs.length;
    const skippedCount = svgCount - optimizedSvgs.length;

    await doCommitChanges(client, config,  {
      fileCount: fileCount,
      fileData: { optimized: optimizedSvgs, original: svgs },
      ignoredCount: ignoredCount,
      optimizedCount: optimizedCount,
      skippedCount: skippedCount,
      svgCount: svgCount,
    });

    core.info(`Successfully optimized ${optimizedCount}/${svgCount} SVG(s)`);
    core.info(`  (${skippedCount}/${svgCount} SVG(s) skipped)`);
  } else {
    core.info(`Found 0/${fileCount} new or changed SVGs, exiting`);
  }
}
