import * as core from "@actions/core";
import * as github from "@actions/github";
import SVGO from "svgo";

import { decode, encode } from "./encoder";
import { existingFiles, svgFiles } from "./filters";
import {
  PR_NOT_FOUND,

  // Types
  CommitInfo,
  FileData,
  FileInfo,
  GitBlob,

  // Functions
  commitFiles,
  createBlob,
  getPrFile,
  getPrFiles,
  getPrNumber,
} from "./github-api";
import { getConfigurationPath, getDryRun, getRepoToken } from "./inputs";
import { SVGOptimizer, getDefaultSvgoOptions } from "./svgo";


export default async function main(): Promise<boolean> {
  try {
    const configPath = getConfigurationPath();
    const token = getRepoToken();

    const dryRun = getDryRun();
    if (dryRun) {
      core.info("Dry mode is enabled, no changes will be committed");
    }

    const prNumber: number = getPrNumber();
    if (prNumber === PR_NOT_FOUND) {
      core.error("Could not get Pull Request number from context, exiting");
      return false;
    }

    const client: github.GitHub = new github.GitHub(token);

    const svgoOptions: SVGO.Options = await getDefaultSvgoOptions(client);
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
    let optimized = 0, skipped = 0;
    for (const svgFileInfo of prSvgs) {
      core.debug(`fetching file contents of '${svgFileInfo.path}'`);
      const fileData: FileData = await getPrFile(client, svgFileInfo.path);

      core.debug(`decoding ${fileData.encoding}-encoded '${svgFileInfo.path}'`);
      const originalSvg: string = decode(fileData.content, fileData.encoding);

      core.debug(`optimizing '${svgFileInfo.path}'`);
      const optimizedSvg: string = await svgo.optimize(originalSvg);
      if (originalSvg === optimizedSvg) {
        core.debug(`skipping '${fileData.path}', already optimized`);
        skipped += 1;
        continue;
      }

      core.debug(`encoding optimized '${svgFileInfo.path}' back to ${fileData.encoding}`);
      const optimizedData: string = encode(optimizedSvg, fileData.encoding);

      core.debug(`create blob to commit for optimized '${svgFileInfo.path}'`);
      const svgBlob: GitBlob = await createBlob(
        client,
        fileData.path,
        optimizedData,
        fileData.encoding,
      );

      blobs.push(svgBlob);
      optimized += 1;
    }

    if (dryRun) {
      core.info("Dry mode enabled, not commiting");
    } else if (blobs.length > 0) {
      const commitInfo: CommitInfo = await commitFiles(
        client,
        blobs,
        "Optimize SVGs with SVGO",
      );

      core.debug(`commit successful (see ${commitInfo.url})`);
    }

    core.info(`Successfully optimized ${optimized}/${svgCount} SVG(s) (${skipped}/${svgCount} SVG(s) skipped)`);
    return true;
  } catch (error) {
    core.setFailed(`action failed with error '${error}'`);
    return false;
  }
}

main();
