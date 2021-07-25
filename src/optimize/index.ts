/* eslint-disable security/detect-non-literal-fs-filename */

import type { IMinimatch } from "minimatch";

import type { FileHandle, FileSystem } from "../file-systems";
import type { error, OptimizeProjectData } from "../types";

import { Minimatch } from "minimatch";

interface ReadFileHandle extends FileHandle {
  readonly path: string;
  readonly content: string;
}

interface OptimizedFileHandle extends ReadFileHandle {
  readonly optimizedContent: string;
}

interface Optimizer {
  optimize(s: string): Promise<[string, error]>;
}

interface Params {
  readonly fs: FileSystem;
  readonly config: {
    readonly ignoreGlob: string;
    readonly isDryRun: boolean;
  };
  readonly optimizer: Optimizer;
}

async function readFile(
  fs: FileSystem,
  file: FileHandle,
): Promise<[ReadFileHandle, error]> {
  const [content, err] = await fs.readFile(file);
  return [{ ...file, content }, err];
}

async function readFiles(
  fs: FileSystem,
  ignoreMatcher: IMinimatch,
): Promise<{
  files: [ReadFileHandle, error][],
  ignoredSvgCount: number,
  totalSvgCount: number,
}> {
  let totalSvgCount = 0, ignoredSvgCount = 0;
  const promises: Promise<[ReadFileHandle, error]>[] = [];
  for (const file of fs.listFiles()) {
    totalSvgCount++;
    if (ignoreMatcher.match(file.path)) {
      ignoredSvgCount++;
      continue;
    }

    const promise = readFile(fs, file);
    promises.push(promise);
  }

  const files = await Promise.all(promises);
  return { files, ignoredSvgCount, totalSvgCount };
}

async function optimizeFile(
  optimizer: Optimizer,
  file: ReadFileHandle,
): Promise<[OptimizedFileHandle, error]> {
  const [optimizedContent, err] = await optimizer.optimize(file.content);
  return [{ ...file, optimizedContent }, err];
}

async function optimizeAll(
  optimizer: Optimizer,
  files: ReadFileHandle[],
): Promise<OptimizedFileHandle[]> {
  const promises: Promise<[OptimizedFileHandle, error]>[] = [];
  for (const file of files) {
    const promise = optimizeFile(optimizer, file);
    promises.push(promise);
  }

  const optimizedFiles = await Promise.all(promises);
  return optimizedFiles
    .filter(([_, err]) => err === null)
    .map(([file, _]) => file)
    .filter((file) => file.content !== file.optimizedContent);
}

async function writeFiles(
  fs: FileSystem,
  files: OptimizedFileHandle[],
): Promise<error[]> {
  const promises: Promise<error>[] = [];
  for (const file of files) {
    const promise = fs.writeFile(file, file.optimizedContent);
    promises.push(promise);
  }

  return await Promise.all(promises);
}

async function Files({
  config,
  fs,
  optimizer,
}: Params): Promise<[OptimizeProjectData, error]> {
  const ignoreMatcher = new Minimatch(config.ignoreGlob);

  const {
    files,
    ignoredSvgCount,
    totalSvgCount,
  } = await readFiles(fs, ignoreMatcher);

  const filesToOptimize = files
    .filter(([_, err]) => err === null)
    .map(([file, _]) => file);

  const optimizedFiles = await optimizeAll(optimizer, filesToOptimize);
  if (!config.isDryRun) {
    await writeFiles(fs, optimizedFiles);
  }

  const optimizeProjectData: OptimizeProjectData = {
    ignoredCount: ignoredSvgCount,
    optimizedCount: optimizedFiles.length,
    svgCount: totalSvgCount,
  };

  return [optimizeProjectData, null];
}

export default {
  Files,
};
