import * as core from "@actions/core";
import { GitHub } from "@actions/github";
import * as yaml from "js-yaml";

import { decode, encode } from "./encoder";
import { existingFiles, svgFiles } from "./filters";
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
import { formatComment, formatTemplate } from "./templating";


const DISABLE_PATTERN = /disable-svgo-action/;
const ENABLE_PATTERN = /enable-svgo-action/;


export type FileData = {
  readonly path: string;
  readonly encoding: string;

  readonly original: string;
  optimized: string;
}


async function fetchConfigInRepo(client: GitHub): Promise<RawActionConfig> {
  const configFilePath: string = getConfigFilePath();
  try {
    const { content, encoding } = await getRepoFile(client, configFilePath);
    core.debug(`configuration file for Action found ('${configFilePath}')`);

    const rawActionConfig: string = decode(content, encoding);
    return yaml.safeLoad(rawActionConfig);
  } catch(_) {
    core.debug(`configuration file for Action not found ('${configFilePath}')`);
    return { };
  }
}

async function fetchSvgoOptions(
  client: GitHub,
  optionsFilePath: string,
): Promise<SVGOptions> {
  try {
    const { content, encoding } = await getRepoFile(client, optionsFilePath);
    core.debug(`options file for SVGO found ('${optionsFilePath}')`);

    const rawSvgoOptions: string = decode(content, encoding);
    return yaml.safeLoad(rawSvgoOptions);
  } catch(_) {
    core.debug(`options file for SVGO not found ('${optionsFilePath}')`);
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
): Promise<{ fileCount: number; svgCount: number; svgsData: FileData[] }> {
  core.debug(`fetching changed files for pull request #${prNumber}`);

  const prFiles: GitFileInfo[] = await getPrFiles(client, prNumber);
  const fileCount = prFiles.length;
  core.debug(`the pull request contains ${fileCount} file(s)`);

  const prSvgs: GitFileInfo[] = prFiles.filter(svgFiles).filter(existingFiles);
  const svgCount = prSvgs.length;
  core.debug(`the pull request contains ${svgCount} SVG(s)`);

  const svgsData: FileData[] = [];
  for (const svg of prSvgs) {
    core.debug(`fetching file contents of '${svg.path}'`);
    const fileData: GitFileData = await getPrFile(client, svg.path);

    core.debug(`decoding ${fileData.encoding}-encoded '${svg.path}'`);
    const svgContent: string = decode(fileData.content, fileData.encoding);

    svgsData.push({
      encoding: fileData.encoding,
      original: svgContent,
      optimized: svgContent,
      path: svg.path,
    });
  }

  return { fileCount, svgCount, svgsData };
}

async function doOptimizeSvg(
  client: GitHub,
  svgo: SVGOptimizer,
  svg: FileData,
): Promise<GitBlob | undefined> {
  try {
    core.debug(`optimizing '${svg.path}'`);
    const optimizedSvg: string = await svgo.optimize(svg.original);
    if (svg.original == optimizedSvg) {
      core.debug(`skipping '${svg.path}', already optimized`);
      return;
    }

    svg.optimized = optimizedSvg;

    core.debug(`encoding optimized '${svg.path}' back to ${svg.encoding}`);
    const optimizedData: string = encode(optimizedSvg, svg.encoding);

    core.debug(`creating blob for optimized '${svg.path}'`);
    const svgBlob: GitBlob = await createBlob(
      client,
      svg.path,
      optimizedData,
      svg.encoding,
    );

    return svgBlob;
  } catch(_) {
    core.info(`SVGO cannot optimize '${svg.path}', source incorrect`);
  }
}

async function doOptimizeSvgs(
  client: GitHub,
  svgo: SVGOptimizer,
  svgsData: FileData[],
): Promise<GitBlob[]> {
  const blobs: GitBlob[] = [];
  for (const svgData of svgsData) {
    const svgBlob = await doOptimizeSvg(client, svgo, svgData);
    if (svgBlob !== undefined) {
      blobs.push(svgBlob);
    }
  }

  return blobs;
}

async function doCommitChanges(
  client: GitHub,
  commitMessage: string,
  blobs: GitBlob[],
): Promise<void> {
  if (blobs.length > 0) {
    const commitInfo: CommitInfo = await commitFiles(
      client,
      blobs,
      commitMessage,
    );

    core.debug(`commit successful (see ${commitInfo.url})`);
  }
}

async function run(
  client: GitHub,
  config: ActionConfig,
  svgo: SVGOptimizer,
  prNumber: number,
): Promise<void> {
  const { fileCount, svgCount, svgsData } = await getSvgsInPR(client, prNumber);
  if (svgCount > 0) {
    core.info(`Found ${svgCount}/${fileCount} new or changed SVG(s), optimizing...`);
    const blobs: GitBlob[] = await doOptimizeSvgs(client, svgo, svgsData);
    const optimizedCount = blobs.length;
    const skippedCount = svgCount - blobs.length;

    if (!config.isDryRun) {
      const data = { fileCount, optimizedCount, skippedCount, svgCount,
        filePaths: svgsData.map((svg) => svg.path),
        fileTable: svgsData,
      };

      const commitMessage: string = formatTemplate(config.commitTitle, config.commitDescription, data);
      await doCommitChanges(client, commitMessage, blobs);

      const comment: string = formatComment(data);
      await createComment(client, prNumber, comment);
    }

    core.info(`Successfully optimized ${optimizedCount}/${svgCount} SVG(s) (${skippedCount}/${svgCount} SVG(s) skipped)`);
  } else {
    core.info(`Found 0/${fileCount} new or changed SVGs, exiting`);
  }
}


export default async function main(): Promise<void> {
  try {
    const { client, prNumber } = getContext();

    const rawConfig: RawActionConfig = await fetchConfigInRepo(client);
    const config: ActionConfig = new ActionConfig(rawConfig);
    if (config.isDryRun) {
      core.info("Dry mode enabled, no changes will be committed");
    }

    const svgoOptions: SVGOptions = await fetchSvgoOptions(client, config.svgoOptionsPath);
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
