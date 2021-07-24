import type { error, Context } from "../types";

interface FileHandle {
  readonly path: string;
  readonly extension: string;
}

interface FileSystem {
  readonly listFiles: ListFilesFn;
  readonly readFile: ReadFileFn;
  readonly writeFile: WriteFileFn;
}

type ListFilesFn = () => Iterable<FileHandle>;

type ReadFileFn = (file: FileHandle) => Promise<[string, error]>;

type WriteFileFn = (file: FileHandle, content: string) => Promise<error>;

export {
  Context,
  FileHandle,
  FileSystem,
  ListFilesFn,
  ReadFileFn,
  WriteFileFn,
};
