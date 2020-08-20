import * as core from "@actions/core";
import { Octokit } from "@octokit/core";

import { commitFiles, createBlob, getPrFile } from "./github-api";
import { decode, encode } from "./encoder";
import { existingFiles, filesNotMatching, svgFiles } from "./filters";
import { ActionConfig } from "./inputs";
import { SVGOptimizer } from "./svgo";
import { formatCommitMessage } from "./templating";
import {
  CommitData,
  ContextInfo,
  FileData,

  // Git
  CommitInfo,
  GitBlob,
  GitFileData,
  GitFileInfo,
} from "./types";


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


export async function doFilterSvgsFromFiles(
  client: Octokit,
  files: GitFileInfo[],
  ignoreGlob: string,
): Promise<ContextInfo> {
  const fileCount = files.length;
  core.debug(`found ${fileCount} file(s)`);

  const svgsInfo: GitFileInfo[] = files.filter(svgFiles).filter(existingFiles);
  const svgCount = svgsInfo.length;
  core.debug(`found ${svgCount} SVG(s)`);

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

  return { fileCount, ignoredCount, svgs };
}

export async function doOptimizeAndCommit(
  client: Octokit,
  ref: string,
  config: ActionConfig,
  svgo: SVGOptimizer,
  context: ContextInfo,
): Promise<CommitData> {
  const { fileCount, ignoredCount, svgs } = context;

  core.info(`Found ${svgs.length}/${fileCount} SVG(s), optimizing...`);
  const optimizedSvgs: FileData[] = await doOptimizeSvgs(svgo, svgs);

  const commitData: CommitData = {
    fileCount: fileCount,
    fileData: { optimized: optimizedSvgs, original: svgs },
    ignoredCount: ignoredCount,
    optimizedCount: optimizedSvgs.length,
    skippedCount: svgs.length - optimizedSvgs.length,
    svgCount: svgs.length,
  };

  if (!config.isDryRun && optimizedSvgs.length > 0) {
    const blobs: GitBlob[] = await toBlobs(client, optimizedSvgs);
    const commitMessage: string = formatCommitMessage(
      config.commitTitle,
      config.commitBody,
      commitData,
    );

    core.debug(`committing ${optimizedSvgs.length} updated SVG(s)`);
    const commitInfo: CommitInfo = await commitFiles(
      client,
      blobs,
      ref,
      commitMessage,
    );
    core.debug(`commit successful (see ${commitInfo.url})`);
  }

  const optimizedRatio = `${optimizedSvgs.length}/${svgs.length}`;
  const skippedRatio = `${svgs.length - optimizedSvgs.length}/${svgs.length}`;
  core.info(`Successfully optimized ${optimizedRatio} SVG(s)`);
  core.info(`  (${skippedRatio} SVG(s) skipped)`);

  return commitData;
}
