import type { error } from "../errors";
import type {
  OptimizedFileHandle,
  Optimizer,
  ReadFileHandle,
} from "./types";

import errors from "../errors";
import { len } from "../utils";

interface OptimizeResults {
  readonly fileCount: number;
  readonly optimizedFiles: Iterable<OptimizedFileHandle>;
}

const NO_FILE = null as unknown as OptimizedFileHandle; // type-coverage:ignore-line

async function optimizeFile(
  optimizer: Optimizer,
  filePromise: Promise<[ReadFileHandle, error]>,
): Promise<[OptimizedFileHandle, error]> {
  const [file, err0] = await filePromise;
  if (err0 !== null) {
    return [NO_FILE, err0];
  }

  const [optimizedContent, err1] = await optimizer.optimize(file.content);
  return [{ ...file, optimizedContent }, err1];
}

async function optimizeAll(
  optimizer: Optimizer,
  files: Iterable<Promise<[ReadFileHandle, error]>>,
): Promise<[OptimizeResults, error]> {
  const promises: Promise<[OptimizedFileHandle, error]>[] = [];
  for (const file of files) {
    const promise = optimizeFile(optimizer, file);
    promises.push(promise);
  }

  const filesAndErrors = await Promise.all(promises);
  const optimizedFiles = filesAndErrors
    .filter(([, err]) => err === null)
    .map(([files]) => files)
    .filter((file) => file.content !== file.optimizedContent);
  const errs = filesAndErrors.map(([, err]) => err);

  return [
    { fileCount: len(promises), optimizedFiles },
    errors.Combine(...errs),
  ];
}

export {
  optimizeAll,
};
