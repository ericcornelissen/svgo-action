import * as core from "@actions/core";
import * as github from "@actions/github";

import {
  PR_NOT_FOUND,

  FileInfo,

  getPrFile,
  getPrNumber,
  getPrFiles,
} from './github-api'


const SVG_FILE_EXTENSION: string = ".svg";

const STATUS_ADDED: string = "added";
const STATUS_MODIFIED: string = "modified";


async function main(): Promise<void> {
  try {
    const token = core.getInput("repo-token", { required: true });
    const configPath = core.getInput("configuration-path", { required: true });

    const prNumber: number = getPrNumber();
    if (prNumber === PR_NOT_FOUND) {
      console.info("Could not get Pull Request number from context, exiting");
      return;
    }

    const client: github.GitHub = new github.GitHub(token);

    core.debug(`fetching changed files for pull request #${prNumber}`);
    const prFiles: FileInfo[] = await getPrFiles(client, prNumber);
    console.log("[info]", prFiles);

    const prSvgs: FileInfo[] = prFiles.filter(svgFiles).filter(existingFiles);
    console.log("[info]", prSvgs);

    for (const svgFileInfo of prSvgs) {
      core.debug(`fetch file contents of '${svgFileInfo.path}'`);
      const fileContent: any = await getPrFile(client, svgFileInfo.path);
      console.log("[info]", fileContent);
    }
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function svgFiles(fileInfo: FileInfo): boolean {
  return fileInfo.path.endsWith(SVG_FILE_EXTENSION);
}

function existingFiles(fileInfo: FileInfo): boolean {
  return fileInfo.status === STATUS_MODIFIED
      || fileInfo.status === STATUS_ADDED;
}


main();
