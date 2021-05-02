/* eslint-disable security/detect-non-literal-fs-filename */

import type { IMinimatch } from "minimatch";

import type { FileInfo, FileSystem } from "./file-system";
import type { OptimizeProjectData } from "./types";

import { Minimatch } from "minimatch";

import { ActionConfig } from "./inputs";
import { SVGOptimizer } from "./svgo";

interface ReadFileInfo extends FileInfo {
  readonly path: string;
  readonly content: string;
}

interface OptimizedFileInfo extends ReadFileInfo {
  readonly optimizedContent: string;
}

async function readSvg(
  fs: FileSystem,
  file: FileInfo,
): Promise<ReadFileInfo> {
  const content = await fs.readFile(file);
  return { ...file, content };
}

async function readSvgs(
  fs: FileSystem,
  ignoreMatcher: IMinimatch,
): Promise<{ files: ReadFileInfo[], totalSvgCount: number }> {
  let totalSvgCount = 0;
  const promises: Promise<ReadFileInfo>[] = [];
  for (const file of fs.listFiles(".", true)) {
    if (file.extension !== ".svg") {
      continue;
    }

    totalSvgCount++;
    if (ignoreMatcher.match(file.path)) {
      continue;
    }

    const promise = readSvg(fs, file);
    promises.push(promise);
  }

  const files = await Promise.all(promises);
  return { files, totalSvgCount };
}

async function optimizeSvg(
  svgo: SVGOptimizer,
  file: ReadFileInfo,
): Promise<OptimizedFileInfo> {
  const optimizedContent = await svgo.optimize(file.content);
  return { ...file, optimizedContent };
}

async function optimizeSvgs(
  svgo: SVGOptimizer,
  files: ReadFileInfo[],
): Promise<OptimizedFileInfo[]> {
  const promises: Promise<OptimizedFileInfo>[] = [];
  for (const file of files) {
    const promise = optimizeSvg(svgo, file);
    promises.push(promise);
  }

  const optimizedFiles = await Promise.all(promises);
  return optimizedFiles.filter((f) => f.content !== f.optimizedContent);
}

async function writeOptimizedSvgs(
  fs: FileSystem,
  files: OptimizedFileInfo[],
): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const file of files) {
    const promise = fs.writeFile(file, file.optimizedContent);
    promises.push(promise);
  }

  await Promise.all(promises);
}

export async function optimize(
  fs: FileSystem,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<OptimizeProjectData> {
  const ignoreMatcher = new Minimatch(config.ignoreGlob);

  const { files, totalSvgCount } = await readSvgs(fs, ignoreMatcher);
  const optimizedFiles = await optimizeSvgs(svgo, files);
  if (!config.isDryRun) {
    await writeOptimizedSvgs(fs, optimizedFiles);
  }

  return {
    optimizedCount: optimizedFiles.length,
    skippedCount: totalSvgCount - optimizedFiles.length,
    svgCount: totalSvgCount,
  };
}
