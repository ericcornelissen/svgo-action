/* eslint-disable security/detect-non-literal-fs-filename */

import type { IMinimatch } from "minimatch";

import type { Config } from "./configs";
import type { FileHandle, FileSystem } from "./file-systems";
import type { SVGOptimizer } from "./svgo";
import type { error, OptimizeProjectData } from "./types";

import { Minimatch } from "minimatch";


interface ReadFileHandle extends FileHandle {
  readonly path: string;
  readonly content: string;
}

interface OptimizedFileHandle extends ReadFileHandle {
  readonly optimizedContent: string;
}

interface Params {
  readonly fs: FileSystem;
  readonly config: Config;
  readonly svgo: SVGOptimizer;
}

async function readSvg(
  fs: FileSystem,
  file: FileHandle,
): Promise<[ReadFileHandle, error]> {
  const [content, err] = await fs.readFile(file);
  return [{ ...file, content }, err];
}

async function readSvgs(
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
    if (file.extension !== ".svg") {
      continue;
    }

    totalSvgCount++;
    if (ignoreMatcher.match(file.path)) {
      ignoredSvgCount++;
      continue;
    }

    const promise = readSvg(fs, file);
    promises.push(promise);
  }

  const files = await Promise.all(promises);
  return { files, ignoredSvgCount, totalSvgCount };
}

async function optimizeSvg(
  svgo: SVGOptimizer,
  file: ReadFileHandle,
): Promise<[OptimizedFileHandle, error]> {
  const [optimizedContent, err] = await svgo.optimize(file.content);
  return [{ ...file, optimizedContent }, err];
}

async function optimizeAllSvgs(
  svgo: SVGOptimizer,
  files: ReadFileHandle[],
): Promise<OptimizedFileHandle[]> {
  const promises: Promise<[OptimizedFileHandle, error]>[] = [];
  for (const file of files) {
    const promise = optimizeSvg(svgo, file);
    promises.push(promise);
  }

  const optimizedFiles = await Promise.all(promises);
  return optimizedFiles
    .filter(([_, err]) => err === null)
    .map(([file, _]) => file)
    .filter((file) => file.content !== file.optimizedContent);
}

async function writeOptimizedSvgs(
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

async function optimizeSvgs({
  fs,
  config,
  svgo,
}: Params): Promise<[OptimizeProjectData, error]> {
  const ignoreMatcher = new Minimatch(config.ignoreGlob);

  const {
    files,
    ignoredSvgCount,
    totalSvgCount,
  } = await readSvgs(fs, ignoreMatcher);

  const readFiles = files
    .filter(([_, err]) => err === null)
    .map(([file, _]) => file);

  const optimizedFiles = await optimizeAllSvgs(svgo, readFiles);
  if (!config.isDryRun) {
    await writeOptimizedSvgs(fs, optimizedFiles);
  }

  const optimizeProjectData: OptimizeProjectData = {
    ignoredCount: ignoredSvgCount,
    optimizedCount: optimizedFiles.length,
    svgCount: totalSvgCount,
  };

  return [optimizeProjectData, null];
}

export {
  optimizeSvgs,
};
