export type { Context, Client } from "../types";

export type FileInfo = {
  readonly path: string;
  readonly extension: string;
}

export type ListFilesFn = (
  fileOrFolder: string,
  recursive?: boolean,
) => Iterable<FileInfo>;

export type ReadFileFn = (file: FileInfo | string) => Promise<string>;

export type WriteFileFn = (file: FileInfo, content: string) => Promise<void>;

export type FileSystem = {
  readonly listFiles: ListFilesFn;
  readonly readFile: ReadFileFn;
  readonly writeFile: WriteFileFn;
}
