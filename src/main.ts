import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";

import { DISABLE_PATTERN, ENABLE_PATTERN, PR_NOT_FOUND } from "./constants";
import { decode, encode } from "./encoder";
import { existingFiles, filesNotMatching, svgFiles } from "./filters";
import {
  commitFiles,
  createBlob,
  createComment,
  getCommitMessage,
  getPrComments,
  getPrFile,
  getPrFiles,
  getPrNumber,
} from "./github-api";
import {
  ActionConfig,
  getConfigFilePath,
  getRepoToken,
} from "./inputs";
import { SVGOptimizer, SVGOptions } from "./svgo";
import { formatComment, formatCommitMessage } from "./templating";
import {
  FileData,
  CommitData,
  RawActionConfig,

  // Git
  CommitInfo,
  GitBlob,
  GitFileData,
  GitFileInfo,
} from "./types";

import { fetchYamlFile } from "./utils/fetch-yaml";



function getContext(): { client: Octokit; prNumber: number } {
  const token: string = getRepoToken();
  const client: Octokit = github.getOctokit(token);

  const prNumber: number = getPrNumber();
  if (prNumber === PR_NOT_FOUND) {
    throw new Error("Could not get Pull Request number from context");
  }

  return { client, prNumber };
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
  const commitMessage: string = await getCommitMessage(client);
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
): Promise<{
  fileCount: number;
  ignoredCount: number;
  svgCount: number;
  svgs: FileData[];
}> {
  core.debug(`fetching changed files for pull request #${prNumber}`);

  const prFiles: GitFileInfo[] = await getPrFiles(client, prNumber);
  const fileCount = prFiles.length;
  core.debug(`the pull request contains ${fileCount} file(s)`);

  const prSvgs: GitFileInfo[] = prFiles.filter(svgFiles).filter(existingFiles);
  const svgCount = prSvgs.length;
  core.debug(`the pull request contains ${svgCount} SVG(s)`);

  const notGlobbedFiles = filesNotMatching(ignoreGlob);
  const notIgnoredSvgs: GitFileInfo[] = prSvgs.filter(notGlobbedFiles);
  const ignoredCount = svgCount - notIgnoredSvgs.length;
  core.debug(`${ignoredCount} SVG(s) matching '${ignoreGlob}' will be ignored`);

  const svgs: FileData[] = [];
  for (const svg of notIgnoredSvgs) {
    try {
      core.debug(`fetching file contents of '${svg.path}'`);
      const fileData: GitFileData = await getPrFile(client, svg.path);

      core.debug(`decoding ${fileData.encoding}-encoded '${svg.path}'`);
      const svgContent: string = decode(fileData.content, fileData.encoding);

      svgs.push({
        content: svgContent,
        originalEncoding: fileData.encoding,
        path: fileData.path,
      });
    } catch (err) {
      core.warning(`SVG content could not be obtained (${err})`);
    }
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
    } catch(_) {
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

    try {
      core.debug(`creating blob for (updated) '${file.path}'`);
      const svgBlob: GitBlob = await createBlob(
        client,
        file.path,
        optimizedData,
        file.originalEncoding,
      );

      blobs.push(svgBlob);
    } catch (err) {
      core.warning(`Blob could not be created (${err})`);
    }
  }

  return blobs;
}

async function doCommitChanges(
  client: Octokit,
  prNumber: number,
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

    const commitInfo: CommitInfo = await commitFiles(
      client,
      blobs,
      commitMessage,
    );
    core.debug(`commit successful (see ${commitInfo.url})`);

    if (config.enableComments) {
      core.debug(`creating comment on pull request #${prNumber}`);
      const comment: string = formatComment(config.comment, commitData);
      await createComment(client, prNumber, comment);
    }
  }
}

async function run(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
  prNumber: number,
): Promise<void> {
  const { fileCount, ignoredCount, svgCount, svgs } = await getSvgsInPR(
    client,
    prNumber,
    config.ignoreGlob,
  );

  if (svgCount > 0) {
    core.info(`Found ${svgCount}/${fileCount} new or changed SVG(s)`);
    const optimizedSvgs: FileData[] = await doOptimizeSvgs(svgo, svgs);
    const optimizedCount = optimizedSvgs.length;
    const skippedCount = svgCount - optimizedSvgs.length;

    await doCommitChanges(client, prNumber, config, {
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


export default async function main(): Promise<void> {
  try {
    const { client, prNumber } = getContext();

    const configFilePath: string = getConfigFilePath();
    const rawConfig: RawActionConfig = await fetchYamlFile(
      client,
      configFilePath,
    );

    const config: ActionConfig = new ActionConfig(rawConfig);
    if (config.isDryRun) {
      core.info("Dry mode enabled, no changes will be committed");
    }

    const svgoOptions: SVGOptions = await fetchYamlFile(
      client,
      config.svgoOptionsPath,
    );
    const svgo: SVGOptimizer = new SVGOptimizer(svgoOptions);

    const { isDisabled, disabledFrom } = await actionDisabled(client, prNumber);
    if (isDisabled) {
      core.info(`Action disabled from ${disabledFrom}, exiting`);
    } else {
      await run(client, config, svgo, prNumber);
    }
  } catch (error) {
    core.setFailed(`action failed with error '${error}'`);
  }
}

main();
