/* eslint-disable security/detect-non-literal-fs-filename */

import type { FileHandle, FileSystem } from "../file-systems";
import type { error, OptimizeProjectData } from "../types";

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

async function readFiles(fs: FileSystem): Promise<{
  files: [ReadFileHandle, error][],
  totalSvgCount: number,
}> {
  let totalSvgCount = 0;
  const promises: Promise<[ReadFileHandle, error]>[] = [];
  for (const file of fs.listFiles()) {
    totalSvgCount++;
    const promise = readFile(fs, file);
    promises.push(promise);
  }

  const files = await Promise.all(promises);
  return { files, totalSvgCount };
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
  const { files, totalSvgCount  } = await readFiles(fs);

  const filesToOptimize = files
    .filter(([_, err]) => err === null)
    .map(([file, _]) => file);

  const optimizedFiles = await optimizeAll(optimizer, filesToOptimize);
  if (!config.isDryRun) {
    await writeFiles(fs, optimizedFiles);
  }

  const optimizeProjectData: OptimizeProjectData = {
    optimizedCount: optimizedFiles.length,
    svgCount: totalSvgCount,
  };

  return [optimizeProjectData, null];
}

export default {
  Files,
};
