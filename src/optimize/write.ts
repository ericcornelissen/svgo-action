/* eslint-disable security/detect-non-literal-fs-filename */

import type { FileHandle } from "../file-systems";
import type { error } from "../types";

import errors from "../errors";

interface File extends FileHandle {
  readonly optimizedContent: string;
}

interface FileWriter {
  writeFile(file: FileHandle, content: string): Promise<error>;
}

async function writeFiles(
  fs: FileWriter,
  files: File[],
): Promise<error> {
  const promises: Promise<error>[] = [];
  for (const file of files) {
    const promise = fs.writeFile(file, file.optimizedContent);
    promises.push(promise);
  }

  const errs = await Promise.all(promises);
  return errors.Combine(...errs);
}

export {
  writeFiles,
};

export type {
  FileWriter,
};
