import * as core from "@actions/core";
import * as github from "@actions/github";

import {
  PR_NOT_FOUND,

  FileData,
  FileInfo,

  getPrFile,
  getPrFiles,
  getPrNumber,
} from "./github-api";


const SVG_FILE_EXTENSION = ".svg";

const STATUS_ADDED = "added";
const STATUS_MODIFIED = "modified";


function svgFiles(fileInfo: FileInfo): boolean {
  return fileInfo.path.endsWith(SVG_FILE_EXTENSION);
}

function existingFiles(fileInfo: FileInfo): boolean {
  return fileInfo.status === STATUS_MODIFIED
      || fileInfo.status === STATUS_ADDED;
}

export default async function main(): Promise<boolean> {
  try {
    const token = core.getInput("repo-token", { required: true });
    const configPath = core.getInput("configuration-path", { required: true });

    const prNumber: number = getPrNumber();
    if (prNumber === PR_NOT_FOUND) {
      core.error("Could not get Pull Request number from context, exiting");
      return false;
    }

    const client: github.GitHub = new github.GitHub(token);

    core.debug(`fetching changed files for pull request #${prNumber}`);
    const prFiles: FileInfo[] = await getPrFiles(client, prNumber);

    const prSvgs: FileInfo[] = prFiles.filter(svgFiles).filter(existingFiles);
    for (const svgFileInfo of prSvgs) {
      core.debug(`fetch file contents of '${svgFileInfo.path}'`);
      const fileContent: FileData = await getPrFile(client, svgFileInfo.path);

      // TODO: decode, run SVGO, and commit back
    }

    return true;
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);

    return false;
  }
}


main();
