// SPDX-License-Identifier: MIT

import type {
  FileHandle,
  FileSystem,
  OptimizedFileHandle,
  OptimizeProjectData,
  Optimizer,
} from "./types";
import type { error } from "../errors";

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

function wasOptimized(file: OptimizedFileHandle): boolean {
  return file.content === file.optimizedContent;
}

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

  const result = { ...file, content, optimizedContent };
  const err2 = config.isDryRun.value || wasOptimized(result)
    ? null
    : await fs.writeFile(file, optimizedContent);
  return [result, err2];
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
    .filter(([file]) => !wasOptimized(file));
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
