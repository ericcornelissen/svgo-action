import * as core from "@actions/core";
import { GitHub } from "@actions/github";
import * as yaml from "js-yaml";

import { decode, encode } from "./encoder";
import { existingFiles, svgFiles } from "./filters";
import {
  PR_NOT_FOUND,

  // Types
  CommitInfo,
  FileData,
  FileInfo,
  GitBlob,

  // Functionality
  commitFiles,
  createBlob,
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
import { formatTemplate } from "./templating";


const DISABLE_PATTERN = /disable-svgo-action/;
const ENABLE_PATTERN = /enable-svgo-action/;


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
): Promise<{ fileCount: number; prSvgs: FileInfo[]; svgCount: number }> {
  core.debug(`fetching changed files for pull request #${prNumber}`);
  const prFiles: FileInfo[] = await getPrFiles(client, prNumber);
  const fileCount = prFiles.length;
  core.debug(`the pull request contains ${fileCount} file(s)`);

  const prSvgs: FileInfo[] = prFiles.filter(svgFiles).filter(existingFiles);
  const svgCount = prSvgs.length;
  core.debug(`the pull request contains ${svgCount} SVG(s)`);

  return { fileCount, prSvgs, svgCount };
}

async function doOptimizeSvg(
  client: GitHub,
  svgo: SVGOptimizer,
  svg: FileInfo,
): Promise<GitBlob | undefined> {
  core.debug(`fetching file contents of '${svg.path}'`);
  const fileData: FileData = await getPrFile(client, svg.path);

  core.debug(`decoding ${fileData.encoding}-encoded '${svg.path}'`);
  const originalSvg: string = decode(fileData.content, fileData.encoding);

  try {
    core.debug(`optimizing '${svg.path}'`);
    const optimizedSvg: string = await svgo.optimize(originalSvg);
    if (originalSvg == optimizedSvg) {
      core.debug(`skipping '${fileData.path}', already optimized`);
      return;
    }

    core.debug(`encoding optimized '${svg.path}' back to ${fileData.encoding}`);
    const optimizedData: string = encode(optimizedSvg, fileData.encoding);

    core.debug(`creating blob for optimized '${svg.path}'`);
    const svgBlob: GitBlob = await createBlob(
      client,
      fileData.path,
      optimizedData,
      fileData.encoding,
    );

    return svgBlob;
  } catch(_) {
    core.info(`SVGO cannot optimize '${fileData.path}', source incorrect`);
  }
}

async function doOptimizeSvgs(
  client: GitHub,
  svgo: SVGOptimizer,
  prSvgs: FileInfo[],
): Promise<GitBlob[]> {
  const blobs: GitBlob[] = [];
  for (const svgFileInfo of prSvgs) {
    const svgBlob = await doOptimizeSvg(client, svgo, svgFileInfo);
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
  const { fileCount, prSvgs, svgCount } = await getSvgsInPR(client, prNumber);
  if (svgCount > 0) {
    core.info(`Found ${svgCount}/${fileCount} new or changed SVG(s), optimizing...`);

    const blobs: GitBlob[] = await doOptimizeSvgs(client, svgo, prSvgs);
    const optimized = blobs.length;
    const skipped = svgCount - blobs.length;

    if (!config.isDryRun) {
      const commitMessage: string = formatTemplate(
        config.commitTitle,
        config.commitDescription,
        {
          fileCount: fileCount,
          filePaths: prSvgs.map((svg) => svg.path),
          optimizedCount: optimized,
          skippedCount: skipped,
          svgCount: svgCount,
        },
      );

      await doCommitChanges(client, commitMessage, blobs);
    }

    core.info(`Successfully optimized ${optimized}/${svgCount} SVG(s) (${skipped}/${svgCount} SVG(s) skipped)`);
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
