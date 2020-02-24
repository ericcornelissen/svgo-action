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
  commitFile,
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
    const dryRun = getDryRun();
    const token = getRepoToken();

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
    core.debug(`the pull request contains ${prFiles.length} file(s)`);

    const prSvgs: FileInfo[] = prFiles.filter(svgFiles).filter(existingFiles);
    core.debug(`the pull request contains ${prSvgs.length} SVG(s)`);

    core.debug(`fetching content of files in pull request #${prNumber}`);
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

      if (dryRun) {
        core.info(`Dry mode enabled, not commiting for '${svgFileInfo.path}'`);
      } else {
        core.debug(`committing optimized '${svgFileInfo.path}'`);
        const svgBlob: GitBlob = await createBlob(
          client,
          fileData.path,
          optimizedData,
          fileData.encoding,
        );

        const commitInfo: CommitInfo = await commitFile(
          client,
          svgBlob,
          `Optimize '${fileData.path}' with SVGO`,
        );

        core.debug(`commit successful (see ${commitInfo.url})`);
      }
    }

    return true;
  } catch (error) {
    core.setFailed(`action failed with error '${error}'`);
    return false;
  }
}

main();
