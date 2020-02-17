import { FileInfo } from "./github-api";


const STATUS_ADDED = "added";
const STATUS_MODIFIED = "modified";

const SVG_FILE_EXTENSION = ".svg";


export function existingFiles(fileInfo: FileInfo): boolean {
  return fileInfo.status === STATUS_MODIFIED
      || fileInfo.status === STATUS_ADDED;
}

export function svgFiles(fileInfo: FileInfo): boolean {
  return fileInfo.path.endsWith(SVG_FILE_EXTENSION);
}
