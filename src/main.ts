import * as core from "@actions/core";
import * as github from "@actions/github";

import SVGOptimizer from "./svgo";
import { decode, encode } from "./encoder";
import {
  PR_NOT_FOUND,

  FileData,
  FileInfo,

  getPrFile,
  getPrFiles,
  getPrNumber,

  commit,
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
    const svgo = new SVGOptimizer();

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
      core.debug(`fetching file contents of '${svgFileInfo.path}'`);
      const fileData: FileData = await getPrFile(client, svgFileInfo.path);

      core.debug(`decoding ${fileData.encoding}-encoded '${svgFileInfo.path}'`);
      const originalSvg: string = decode(fileData.content, fileData.encoding);

      core.debug(`optimizing '${svgFileInfo.path}'`);
      const optimizedSvg: string = await svgo.optimize(originalSvg);

      core.debug(`encoding optimized '${svgFileInfo.path}' back to ${fileData.encoding}`);
      const optimizedData: string = encode(optimizedSvg, fileData.encoding);

      core.debug(`commiting optimized '${svgFileInfo.path}'`);
      await commit(
        client,
        fileData.path,
        optimizedData,
        fileData.encoding,
        `Optimize '${fileData.path}' with SVGO`
      );
    }

    return true;
  } catch (error) {
    console.log(error);
    // core.error(error);
    // core.setFailed(error.message);

    return false;
  }
}


main();
