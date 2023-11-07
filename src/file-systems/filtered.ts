// SPDX-License-Identifier: MIT

import type {
  FileFilter,
  FileHandle,
  FileSystem,
  ListFilesFn,
  ReadFileFn,
  WriteFileFn,
} from "./types";
import type { error } from "../errors";

import errors from "../errors";

interface Params {
  readonly fs: FileSystem;
  readonly filters: Iterable<FileFilter>;
}

const errFileNotFound = errors.New("file not found (no access)");

function asOneFilter(filters: Iterable<FileFilter>): FileFilter {
  return function(filepath: string): boolean {
    for (const filter of filters) {
      if (!filter(filepath)) {
        return false;
      }
    }

    return true;
  };
}

function createListFiles(
  fs: FileSystem,
  filter: FileFilter,
): ListFilesFn {
  return function*(): Iterable<FileHandle> {
    for (const file of fs.listFiles()) {
      if (filter(file.path)) {
        yield file;
      }
    }
  };
}

function createReadFile(
  fs: FileSystem,
  filter: FileFilter,
): ReadFileFn {
  return async function(file: FileHandle): Promise<[string, error]> {
    if (!filter(file.path)) {
      return Promise.resolve(["", errFileNotFound]);
    }

    return await fs.readFile(file);
  };
}

function createWriteFile(
  fs: FileSystem,
  filter: FileFilter,
): WriteFileFn {
  return async function(file: FileHandle, content: string): Promise<error> {
    if (!filter(file.path)) {
      return Promise.resolve(errFileNotFound);
    }

    return await fs.writeFile(file, content);
  };
}

function NewFilteredFileSystem({
  fs,
  filters,
}: Params): FileSystem {
  const filter = asOneFilter(filters);
  return {
    listFiles: createListFiles(fs, filter),
    readFile: createReadFile(fs, filter),
    writeFile: createWriteFile(fs, filter),
  };
}

export default NewFilteredFileSystem;
