import type { error, Context } from "../types";

interface FileInfo {
  readonly path: string;
  readonly extension: string;
}

interface FileSystem {
  readonly listFiles: ListFilesFn;
  readonly readFile: ReadFileFn;
  readonly writeFile: WriteFileFn;
}

type ListFilesFn = (
  fileOrFolder: string,
  recursive?: boolean,
) => Iterable<FileInfo>;

type ReadFileFn = (file: FileInfo | string) => Promise<[string, error]>;

type WriteFileFn = (file: FileInfo, content: string) => Promise<error>;

export {
  Context,
  FileInfo,
  FileSystem,
  ListFilesFn,
  ReadFileFn,
  WriteFileFn,
};
