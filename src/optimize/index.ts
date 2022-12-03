import type { error } from "../errors";
import type {
  FileSystem,
  OptimizedFileHandle,
  OptimizeProjectData,
  Optimizer,
  ReadFileHandle,
} from "./types";

import errors from "../errors";
import { len } from "../utils";
import { yieldFiles } from "./read";
import { writeFiles } from "./write";

interface Config {
  readonly isDryRun: {
    readonly value: boolean;
  };
}

interface Params {
  readonly config: Config;
  readonly fs: FileSystem;
  readonly optimizer: Optimizer;
}

const NO_FILE = null as unknown as OptimizedFileHandle; // type-coverage:ignore-line

async function File(
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

async function Files({
  config,
  fs,
  optimizer,
}: Params): Promise<[OptimizeProjectData, error]> {
  const files = yieldFiles(fs);

  const promises: Promise<[OptimizedFileHandle, error]>[] = [];
  for (const file of files) {
    const promise = File(optimizer, file);
    promises.push(promise);
  }

  const filesAndErrors = await Promise.all(promises);
  const optimizedFiles = filesAndErrors
    .filter(([, err]) => err === null)
    .map(([files]) => files)
    .filter((file) => file.content !== file.optimizedContent);
  const errs = filesAndErrors.map(([, err]) => err);

  let writeError: error = null;
  if (!config.isDryRun.value) {
    writeError = await writeFiles(fs, optimizedFiles);
  }

  return [
    {
      optimizedCount: len(optimizedFiles),
      svgCount: len(promises),
    },
    errors.Combine(...errs, writeError),
  ];
}

export default {
  Files,
};
