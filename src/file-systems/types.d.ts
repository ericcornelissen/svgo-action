import type { error } from "../types";

type FileFilter = (filepath: string) => boolean;

interface FileHandle {
  readonly path: string;
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
  FileFilter,
  FileHandle,
  FileSystem,
  ListFilesFn,
  ReadFileFn,
  WriteFileFn,
};
