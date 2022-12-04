/* eslint-disable security/detect-non-literal-fs-filename */

import type { error } from "../errors";
import type {
  FileSystem,
  OptimizedFileHandle,
  OptimizeProjectData,
  Optimizer,
  FileHandle,
} from "./types";

import errors from "../errors";
import { len } from "../utils";

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

async function File(file: FileHandle, {
  config,
  fs,
  optimizer,
}: Params): Promise<[OptimizedFileHandle, error]> {
  const [content, err0] = await fs.readFile(file);
  if (err0 !== null) {
    return [NO_FILE, err0];
  }

  const [optimizedContent, err1] = await optimizer.optimize(content);
  if (err1 !== null) {
    return [NO_FILE, err1];
  }

  const err2 = config.isDryRun.value
    ? null
    : await fs.writeFile(file, optimizedContent);
  return [{ ...file, content, optimizedContent }, err2];
}

async function Files({
  config,
  fs,
  optimizer,
}: Params): Promise<[OptimizeProjectData, error]> {
  const promises: Promise<[OptimizedFileHandle, error]>[] = [];
  for (const file of fs.listFiles()) {
    const promise = File(file, { config, fs, optimizer });
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
