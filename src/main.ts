import * as core from "@actions/core";
import { GitHub } from "@actions/github";
import * as yaml from "js-yaml";

import { decode, encode } from "./encoder";
import { existingFiles, filesNotMatching, svgFiles } from "./filters";
import {
  PR_NOT_FOUND,

  // Types
  CommitInfo,
  GitBlob,
  GitFileData,
  GitFileInfo,

  // Functionality
  commitFiles,
  createBlob,
  createComment,
  getCommitMessage,
  getPrComments,
  getPrFile,
  getPrFiles,
  getPrNumber,
  getRepoFile,
} from "./github-api";
import {
  // Types
  RawActionConfig,

  // Functionality
  ActionConfig,
  getConfigFilePath,
  getRepoToken,
} from "./inputs";
import { SVGOptimizer, SVGOptions } from "./svgo";
import { formatComment, formatCommitMessage } from "./templating";


const DISABLE_PATTERN = /disable-svgo-action/;
const ENABLE_PATTERN = /enable-svgo-action/;

const COMMENT_TEMPLATE = "SVG(s) automatically optimized using [SVGO](https://github.com/svg/svgo) :sparkles:\n\n{{filesTable}}";


export type FileData = {
  readonly content: string;
  readonly originalEncoding: string;
  readonly path: string;
}

export type CommitData = {
  readonly fileCount: number;
  readonly fileData: {
    readonly optimized: FileData[];
    readonly original: FileData[];
  };
  readonly optimizedCount: number;
  readonly skippedCount: number;
  readonly svgCount: number;
}


async function fetchYamlFile(
  client: GitHub,
  filePath: string,
): Promise<any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  try {
    const { content, encoding } = await getRepoFile(client, filePath);
    core.debug(`found '${filePath}', decoding and loading YAML`);

    const rawActionConfig: string = decode(content, encoding);
    return yaml.safeLoad(rawActionConfig);
  } catch(_) {
    core.debug(`file not found ('${filePath}')`);
    return { };
  }
}

function getContext(): { client: GitHub; prNumber: number } {
  const token: string = getRepoToken();
  const client: GitHub = new GitHub(token);

  const prNumber: number = getPrNumber();
  if (prNumber === PR_NOT_FOUND) {
    throw new Error("Could not get Pull Request number from context");
  }

  return { client, prNumber };
}

async function checkIfActionIsDisabledFromPR(
  client: GitHub,
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

async function checkIfActionIsDisabled(
  client: GitHub,
  prNumber: number,
): Promise<{ isDisabled: boolean; disabledFrom: string }> {
  const commitMessage: string = await getCommitMessage(client);
  if (DISABLE_PATTERN.test(commitMessage)) {
    return { isDisabled: true, disabledFrom: "commit message" };
  }

  if (!ENABLE_PATTERN.test(commitMessage)) {
    const disabledFromPR = await checkIfActionIsDisabledFromPR(client, prNumber);
    if (disabledFromPR) {
      return { isDisabled: true, disabledFrom: "Pull Request" };
    }
  }

  return { isDisabled: false, disabledFrom: "" };
}

async function getSvgsInPR(
  client: GitHub,
  prNumber: number,
  ignoredGlob: string,
): Promise<{ fileCount: number; svgCount: number; svgs: FileData[] }> {
  core.debug(`fetching changed files for pull request #${prNumber}`);

  const prFiles: GitFileInfo[] = await getPrFiles(client, prNumber);
  const fileCount = prFiles.length;
  core.debug(`the pull request contains ${fileCount} file(s)`);

  const prSvgs: GitFileInfo[] = prFiles.filter(svgFiles).filter(existingFiles);
  const svgCount = prSvgs.length;
  core.debug(`the pull request contains ${svgCount} SVG(s)`);

  const notIgnoredSvgs: GitFileInfo[] = prSvgs.filter(filesNotMatching(ignoredGlob));
  const ignoredCount = svgCount - notIgnoredSvgs.length;
  core.debug(`${ignoredCount} SVG(s) will be ignored that match '${ignoredGlob}'`);

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

  return { fileCount, svgCount, svgs };
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
  client: GitHub,
  files: FileData[],
): Promise<GitBlob[]> {
  const blobs: GitBlob[] = [];
  for (const file of files) {
    core.debug(`encoding (updated) '${file.path}' back to ${file.originalEncoding}`);
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
  client: GitHub,
  prNumber: number,
  config: ActionConfig,
  commitData: CommitData,
): Promise<void> {
  if (!config.isDryRun && commitData.optimizedCount > 0) {
    const blobs: GitBlob[] = await toBlobs(client, commitData.fileData.optimized);
    const commitMessage: string = formatCommitMessage(
      config.commitTitle,
      config.commitDescription,
      commitData,
    );
    const commitInfo: CommitInfo = await commitFiles(
      client,
      blobs,
      commitMessage,
    );

    core.debug(`commit successful (see ${commitInfo.url})`);

    if (config.enableComments) {
      const comment: string = formatComment(COMMENT_TEMPLATE, commitData);
      await createComment(client, prNumber, comment);
    }
  }
}

async function run(
  client: GitHub,
  config: ActionConfig,
  svgo: SVGOptimizer,
  prNumber: number,
): Promise<void> {
  const { fileCount, svgCount, svgs } = await getSvgsInPR(
    client,
    prNumber,
    config.ignoredGlob,
  );

  if (svgCount > 0) {
    core.info(`Found ${svgCount}/${fileCount} new or changed SVG(s), optimizing...`);
    const optimizedSvgs: FileData[] = await doOptimizeSvgs(svgo, svgs);
    const optimizedCount = optimizedSvgs.length;
    const skippedCount = svgCount - optimizedSvgs.length;

    await doCommitChanges(client, prNumber, config, {
      fileCount: fileCount,
      fileData: { optimized: optimizedSvgs, original: svgs },
      optimizedCount: optimizedCount,
      skippedCount: skippedCount,
      svgCount: svgCount,
    });

    core.info(`Successfully optimized ${optimizedCount}/${svgCount} SVG(s) (${skippedCount}/${svgCount} SVG(s) skipped)`);
  } else {
    core.info(`Found 0/${fileCount} new or changed SVGs, exiting`);
  }
}


export default async function main(): Promise<void> {
  try {
    const { client, prNumber } = getContext();

    const configFilePath: string = getConfigFilePath();
    const rawConfig: RawActionConfig = await fetchYamlFile(client, configFilePath);
    const config: ActionConfig = new ActionConfig(rawConfig);
    if (config.isDryRun) {
      core.info("Dry mode enabled, no changes will be committed");
    }

    const svgoOptions: SVGOptions = await fetchYamlFile(client, config.svgoOptionsPath);
    const svgo: SVGOptimizer = new SVGOptimizer(svgoOptions);

    const { isDisabled, disabledFrom } = await checkIfActionIsDisabled(client, prNumber);
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
