import * as core from "@actions/core";
import * as github from "@actions/github";
import * as yaml from "js-yaml";
import SVGO from "svgo";
import { format as strFormat } from "util";

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
import { SVGOptimizer, getSvgoOptions } from "./svgo";


const DISABLE_PATTERN = /disable-svgo-action/;
const COMMIT_MESSAGE_TEMPLATE = "Optimize %s SVG(s) with SVGO\n\nOptimized SVGs:\n%s";

async function getConfigInRepo(client: github.GitHub): Promise<RawActionConfig> {
  const configFilePath = getConfigFilePath();
  try {
    const { content, encoding } = await getRepoFile(client, configFilePath);
    const rawActionConfig = decode(content, encoding);
    return yaml.safeLoad(rawActionConfig);
  } catch(_) {
    return { };
  }
}


export default async function main(): Promise<boolean> {
  try {
    const token: string = getRepoToken();
    const client: github.GitHub = new github.GitHub(token);

    const rawConfig: RawActionConfig = await getConfigInRepo(client);
    const config: ActionConfig = new ActionConfig(rawConfig);

    const commitMessage: string = await getCommitMessage(client);
    if (DISABLE_PATTERN.test(commitMessage)) {
      core.info("Action disabled from commit message");
      return true;
    }

    if (config.isDryRun()) {
      core.info("Dry mode is enabled, no changes will be committed");
    }

    const prNumber: number = getPrNumber();
    if (prNumber === PR_NOT_FOUND) {
      core.error("Could not get Pull Request number from context, exiting");
      return false;
    }

    const svgoOptionsPath: string = config.getSvgoOptionsPath();
    core.debug(`fetching SVGO options (at ${svgoOptionsPath})`);
    const svgoOptions: SVGO.Options = await getSvgoOptions(client, svgoOptionsPath);
    const svgo: SVGOptimizer = new SVGOptimizer(svgoOptions);

    core.debug(`fetching changed files for pull request #${prNumber}`);
    const prFiles: FileInfo[] = await getPrFiles(client, prNumber);
    const filesCount = prFiles.length;
    core.debug(`the pull request contains ${filesCount} file(s)`);

    const prSvgs: FileInfo[] = prFiles.filter(svgFiles).filter(existingFiles);
    const svgCount = prSvgs.length;
    core.debug(`the pull request contains ${svgCount} SVG(s)`);

    core.info(`Found ${svgCount} new/changed SVGs (out of ${filesCount} files), optimizing...`);

    core.debug(`fetching content of SVGs in pull request #${prNumber}`);
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

    if (config.isDryRun()) {
      core.info("Dry mode enabled, not committing");
    } else if (blobs.length > 0) {
      const commitInfo: CommitInfo = await commitFiles(
        client,
        blobs,
        strFormat(
          COMMIT_MESSAGE_TEMPLATE,
          blobs.length,
          "- " + blobs.map(blob => blob.path).join("\n- "),
        ),
      );

      core.debug(`commit successful (see ${commitInfo.url})`);
    }

    const optimized = blobs.length;
    const skipped = svgCount - blobs.length;
    core.info(`Successfully optimized ${optimized}/${svgCount} SVG(s) (${skipped}/${svgCount} SVG(s) skipped)`);

    return true;
  } catch (error) {
    core.setFailed(`action failed with error '${error}'`);
    return false;
  }
}

main();
