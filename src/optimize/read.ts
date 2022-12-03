/* eslint-disable security/detect-non-literal-fs-filename */

import type { error } from "../errors";
import type { FileHandle, FileReader, ReadFileHandle } from "./types";

async function readFile(
  fs: FileReader,
  file: FileHandle,
): Promise<[ReadFileHandle, error]> {
  const [content, err] = await fs.readFile(file);
  return [{ ...file, content }, err];
}

function* yieldFiles(
  fs: FileReader,
): Iterable<Promise<[ReadFileHandle, error]>> {
  for (const file of fs.listFiles()) {
    yield readFile(fs, file);
  }
}

export {
  yieldFiles,
};

export type {
  FileReader,
};
