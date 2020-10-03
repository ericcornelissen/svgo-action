import { Minimatch, IMinimatch } from "minimatch";

import {
  STATUS_ADDED,
  STATUS_EXISTS,
  STATUS_MODIFIED,
  STATUS_REMOVED,
} from "./constants";
import { GitFileInfo } from "./types";


const SVG_FILE_EXTENSION = ".svg";


export function existingFiles(fileInfo: GitFileInfo): boolean {
  return fileInfo.status === STATUS_ADDED
      || fileInfo.status === STATUS_EXISTS
      || fileInfo.status === STATUS_MODIFIED;
}

export function filesNotMatching(glob: string): ((x: GitFileInfo) => boolean) {
  const matcher: IMinimatch = new Minimatch(glob);
  return (fileInfo: GitFileInfo): boolean => !matcher.match(fileInfo.path);
}

export function svgFiles(fileInfo: GitFileInfo): boolean {
  return fileInfo.path.endsWith(SVG_FILE_EXTENSION);
}

export function removedFiles(fileInfo: GitFileInfo): boolean {
  return fileInfo.status === STATUS_REMOVED;
}
