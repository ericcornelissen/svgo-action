/* eslint-disable security/detect-non-literal-fs-filename */

import type { FileHandle } from "../file-systems";
import type { error } from "../types";
import type { ReadFileHandle } from "./types";

import errors from "../errors";

interface FileReader {
  listFiles(): Iterable<FileHandle>;
  readFile(file: FileHandle): Promise<[string, error]>;
}

async function readFile(
  fs: FileReader,
  file: FileHandle,
): Promise<[ReadFileHandle, error]> {
  const [content, err] = await fs.readFile(file);
  return [{ ...file, content }, err];
}

async function readFiles(fs: FileReader): Promise<[ReadFileHandle[], error]> {
  const promises: Promise<[ReadFileHandle, error]>[] = [];
  for (const file of fs.listFiles()) {
    const promise = readFile(fs, file);
    promises.push(promise);
  }

  const filesAndErrors = await Promise.all(promises);
  const files = filesAndErrors
    .filter(([, err]) => err === null)
    .map(([files]) => files);
  const errs = filesAndErrors.map(([, err]) => err);

  return [
    files,
    errors.Combine(...errs),
  ];
}

export {
  readFiles,
};

export type {
  FileReader,
};
