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

async function checkIfActionIsDisabled(
  client: GitHub,
  prNumber: number,
): Promise<{ isDisabled: boolean; disabledFrom: string }> {
  const commitMessage: string = await getCommitMessage(client);
  if (DISABLE_PATTERN.test(commitMessage)) {
    return { isDisabled: true, disabledFrom: "commit message" };
  }

  for await (const comment of getPrComments(client, prNumber)) {
    if (DISABLE_PATTERN.test(comment)) {
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

  if (svgCount > 0) {
    core.info(`Found ${svgCount} new/changed SVGs (out of ${fileCount} files), optimizing...`);
  } else {
    core.info(`Found 0/${fileCount} new or changed SVGs, exiting`);
  }

  return { fileCount, prSvgs, svgCount };
}

async function doOptimizeSvgs(
  client: GitHub,
  svgo: SVGOptimizer,
  prSvgs: FileInfo[],
): Promise<GitBlob[]> {
  core.debug("fetching content of SVGs in pull request");
  const blobs: GitBlob[] = [];
  for (const svgFileInfo of prSvgs) {
    core.debug(`fetching file contents of '${svgFileInfo.path}'`);
    const fileData: FileData = await getPrFile(client, svgFileInfo.path);

    core.debug(`decoding ${fileData.encoding}-encoded '${svgFileInfo.path}'`);
    const originalSvg: string = decode(fileData.content, fileData.encoding);

    core.debug(`optimizing '${svgFileInfo.path}'`);
    const optimizedSvg: string = await svgo.optimize(originalSvg);
    if (originalSvg === optimizedSvg) {
      core.debug(`skipping '${fileData.path}', already optimized`);
      continue;
    }

    core.debug(`encoding optimized '${svgFileInfo.path}' back to ${fileData.encoding}`);
    const optimizedData: string = encode(optimizedSvg, fileData.encoding);

    core.debug(`creating blob for optimized '${svgFileInfo.path}'`);
    const svgBlob: GitBlob = await createBlob(
      client,
      fileData.path,
      optimizedData,
      fileData.encoding,
    );

    blobs.push(svgBlob);
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


export default async function main(): Promise<void> {
  try {
    const { client, prNumber } = getContext();
    const { isDisabled, disabledFrom } = await checkIfActionIsDisabled(client, prNumber);
    if (isDisabled) {
      core.info(`Action disabled from ${disabledFrom}, exiting`);
    } else {
      const rawConfig: RawActionConfig = await fetchConfigInRepo(client);
      const config: ActionConfig = new ActionConfig(rawConfig);
      if (config.isDryRun) {
        core.info("Dry mode enabled, no changes will be committed");
      }

      const { fileCount, prSvgs, svgCount } = await getSvgsInPR(client, prNumber);
      if (svgCount > 0) {
        const svgoOptions: SVGOptions = await fetchSvgoOptions(client, config.svgoOptionsPath);
        const svgo: SVGOptimizer = new SVGOptimizer(svgoOptions);
        const blobs: GitBlob[] = await doOptimizeSvgs(client, svgo, prSvgs);
        if (!config.isDryRun) {
          const commitMessage: string = formatTemplate(
            config.commitTitle,
            config.commitDescription,
            {
              fileCount: fileCount,
              filePaths: blobs.map((blob) => blob.path),
              optimizedCount: blobs.length,
              svgCount: svgCount,
            },
          );
          await doCommitChanges(client, commitMessage, blobs);
        }

        const optimized = blobs.length;
        const skipped = svgCount - blobs.length;
        core.info(`Successfully optimized ${optimized}/${svgCount} SVG(s) (${skipped}/${svgCount} SVG(s) skipped)`);
      }
    }
  } catch (error) {
    core.setFailed(`action failed with error '${error}'`);
  }
}

main();
