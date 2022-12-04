/* eslint-disable security/detect-non-literal-fs-filename */

import type { error } from "../errors";
import type {
  FileSystem,
  FileWriter,
  OptimizedFileHandle,
  OptimizeProjectData,
  Optimizer,
  ReadFileHandle,
} from "./types";

import errors from "../errors";
import { len } from "../utils";
import { yieldFiles } from "./read";

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

const NOOP_WRITER: FileWriter = {
  writeFile: () => Promise.resolve(null),
};

async function File(
  optimizer: Optimizer,
  writer: FileWriter,
  filePromise: Promise<[ReadFileHandle, error]>,
): Promise<[OptimizedFileHandle, error]> {
  const [file, err0] = await filePromise;
  if (err0 !== null) {
    return [NO_FILE, err0];
  }

  const [optimizedContent, err1] = await optimizer.optimize(file.content);
  const optimizedFile = { ...file, optimizedContent };
  if (err1 !== null) {
    return [NO_FILE, err1];
  }

  const err2 = await writer.writeFile(file, optimizedContent);
  return [optimizedFile, err2];
}

async function Files({
  config,
  fs,
  optimizer,
}: Params): Promise<[OptimizeProjectData, error]> {
  const files = yieldFiles(fs);

  const promises: Promise<[OptimizedFileHandle, error]>[] = [];
  for (const file of files) {
    const promise = config.isDryRun.value
      ? File(optimizer, NOOP_WRITER, file)
      : File(optimizer, fs, file);
    promises.push(promise);
  }

  const filesAndErrors = await Promise.all(promises);
  const optimizedFiles = filesAndErrors
    .filter(([, err]) => err === null)
    .map(([files]) => files)
    .filter((file) => file.content !== file.optimizedContent);
  const errs = filesAndErrors.map(([, err]) => err);

  return [
    {
      optimizedCount: len(optimizedFiles),
      svgCount: len(promises),
    },
    errors.Combine(...errs),
  ];
}

export default {
  Files,
};
