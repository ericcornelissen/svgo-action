import type { error } from "../errors";
import type {
  OptimizedFileHandle,
  Optimizer,
  ReadFileHandle,
} from "./types";

import errors from "../errors";

async function optimizeFile(
  optimizer: Optimizer,
  file: ReadFileHandle,
): Promise<[OptimizedFileHandle, error]> {
  const [optimizedContent, err] = await optimizer.optimize(file.content);
  return [{ ...file, optimizedContent }, err];
}

async function optimizeAll(
  optimizer: Optimizer,
  files: Iterable<ReadFileHandle>,
): Promise<[Iterable<OptimizedFileHandle>, error]> {
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
    optimizedFiles,
    errors.Combine(...errs),
  ];
}

export {
  optimizeAll,
};
