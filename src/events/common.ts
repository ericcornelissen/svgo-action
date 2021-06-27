import * as core from "@actions/core";
import {
  OUTPUT_NAME_DID_OPTIMIZE,
  OUTPUT_NAME_OPTIMIZED_COUNT,
  OUTPUT_NAME_SKIPPED_COUNT,
  OUTPUT_NAME_SVG_COUNT,
} from "../constants";
import { decode, encode } from "../encoder";
import { existingFiles, filesNotMatching, svgFiles } from "../filters";
import { commitFiles, createBlob, getFile } from "../github-api";
import { ActionConfig } from "../inputs";
import { SVGOptimizer } from "../svgo";
import { formatCommitMessage } from "../templating";
import {
  CommitData,
  ContextData,
  FileData,
  Octokit,
  OutputName,

  // Git
  CommitInfo,
  GitBlob,
  GitFileData,
  GitFileInfo,
} from "../types";


function getOutputValueFor(name: OutputName, commitData: CommitData): string {
  switch (name) {
    case OUTPUT_NAME_DID_OPTIMIZE:
      return `${commitData.optimizedCount > 0}`;
    case OUTPUT_NAME_OPTIMIZED_COUNT:
      return `${commitData.optimizedCount}`;
    case OUTPUT_NAME_SKIPPED_COUNT:
      return `${commitData.skippedCount}`;
    case OUTPUT_NAME_SVG_COUNT:
      return `${commitData.svgCount}`;
  }
}

async function getSvgsContent(
  client: Octokit,
  ref: string,
  svgList: GitFileInfo[],
): Promise<{ svgs: FileData[], warnings: string[] }> {
  const svgs: FileData[] = [], warnings: string[] = [];
  for (const svg of svgList) {
    try {
      core.debug(`fetching file contents of '${svg.path}'`);
      const fileData: GitFileData = await getFile(client, ref, svg.path);

      core.debug(`decoding ${fileData.encoding}-encoded '${svg.path}'`);
      const svgContent: string = decode(fileData.content, fileData.encoding);

      svgs.push({
        content: svgContent,
        originalEncoding: fileData.encoding,
        path: fileData.path,
      });
    } catch (downloadError) {
      const warningMsg = `SVG content of ${svg.path} could not be obtained`;
      core.warning(`${warningMsg} (${downloadError})`);
      warnings.push(warningMsg);
    }
  }

  return { svgs, warnings };
}

async function toBlobs(
  client: Octokit,
  files: FileData[],
): Promise<{ blobs: GitBlob[], warnings: string[] }> {
  const blobs: GitBlob[] = [], warnings: string[] = [];
  for (const file of files) {
    core.debug(`encoding (updated) '${file.path}' to ${file.originalEncoding}`);
    const optimizedData: string = encode(file.content, file.originalEncoding);

    try {
      core.debug(`creating blob for (updated) '${file.path}'`);
      const svgBlob: GitBlob = await createBlob(
        client,
        file.path,
        optimizedData,
        file.originalEncoding,
      );

      blobs.push(svgBlob);
    } catch (uploadError) {
      const warningMsg = `Blob for ${file.path} could not be created`;
      core.warning(`${warningMsg} (${uploadError})`);
      warnings.push(warningMsg);
    }
  }

  return { blobs, warnings };
}


export async function doCommit(
  client: Octokit,
  ref: string,
  config: ActionConfig,
  commitData: CommitData,
): Promise<void> {
  const {
    fileData: { optimized },
    optimizedCount,
    skippedCount,
    svgCount,
  } = commitData;

  if (!config.isDryRun && optimized.length > 0) {
    const { blobs, warnings } = await toBlobs(client, optimized);
    commitData.warnings.push(...warnings);

    const commitMessage: string = formatCommitMessage(
      config.commitTitle,
      config.commitBody,
      commitData,
    );

    core.debug(`committing ${optimizedCount} updated SVG(s)`);
    const commitInfo: CommitInfo = await commitFiles(
      client,
      blobs,
      ref,
      commitMessage,
    );
    core.debug(`commit successful (see ${commitInfo.url})`);
  }

  core.info(`Successfully optimized ${optimizedCount}/${svgCount} SVG(s)`);
  core.info(`  (${skippedCount}/${svgCount} SVG(s) skipped)`);
}

export async function doFilterSvgsFromFiles(
  client: Octokit,
  ref: string,
  files: GitFileInfo[],
  ignoreGlob: string,
): Promise<ContextData> {
  const fileCount = files.length;
  core.debug(`found ${fileCount} file(s)`);

  const svgsInfo: GitFileInfo[] = files.filter(svgFiles).filter(existingFiles);
  const svgCount = svgsInfo.length;
  core.debug(`found ${svgCount} SVG(s)`);

  const notGlobbedFiles = filesNotMatching(ignoreGlob);
  const notIgnoredSvgs: GitFileInfo[] = svgsInfo.filter(notGlobbedFiles);
  const ignoredCount = svgCount - notIgnoredSvgs.length;
  core.debug(`${ignoredCount} SVG(s) matching '${ignoreGlob}' will be ignored`);

  const { warnings, svgs } = await getSvgsContent(client, ref, notIgnoredSvgs);
  return { fileCount, ignoredCount, svgs, warnings };
}

export async function doOptimizeSvgs(
  svgo: SVGOptimizer,
  originalSvgs: FileData[],
): Promise<FileData[]> {
  core.info(`Found ${originalSvgs.length} SVG(s), optimizing...`);

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

export function getCommitData(
  context: ContextData,
  optimizedSvgs: FileData[],
): CommitData {
  const { fileCount, ignoredCount, svgs, warnings } = context;
  return {
    fileCount: fileCount,
    fileData: { optimized: optimizedSvgs, original: svgs },
    ignoredCount: ignoredCount,
    optimizedCount: optimizedSvgs.length,
    skippedCount: svgs.length - optimizedSvgs.length,
    svgCount: svgs.length,
    warnings: warnings,
  };
}

export function setOutputValues(
  commitData: CommitData,
  names: OutputName[],
): void {
  names.forEach((name) => {
    const value = getOutputValueFor(name, commitData);
    core.setOutput(name, value);
  });
}
