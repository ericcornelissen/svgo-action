/* eslint-disable security/detect-non-literal-fs-filename */

import type { OptimizeFileData, OptimizeProjectData } from "./types";

import { Minimatch } from "minimatch";

import { FileInfo, FileSystem } from "./file-system";
import { ActionConfig } from "./inputs";
import { SVGOptimizer } from "./svgo";

async function optimize(
  fs: FileSystem,
  svgo: SVGOptimizer,
  file: FileInfo,
): Promise<OptimizeFileData> {
  const originalContent = await fs.readFile(file);
  const optimizedContent = await svgo.optimize(originalContent);
  await fs.writeFile(file, optimizedContent);

  return {
    contentAfter: optimizedContent,
    contentBefore: originalContent,
    path: file.path,
  };
}

export default async function main(
  fs: FileSystem,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<OptimizeProjectData> {
  const matcher = new Minimatch(config.ignoreGlob);

  let svgCount = 0;
  const promises: Promise<OptimizeFileData>[] = [];

  for (const file of fs.listFiles(".", true)) {
    if (file.extension !== ".svg") {
      continue;
    }

    svgCount++;
    if (matcher.match(file.path)) {
      continue;
    }

    const filePromise = optimize(fs, svgo, file);
    promises.push(filePromise);
  }

  const files: OptimizeFileData[] = await Promise.all(promises);

  return {
    files: files,
    svgCount: svgCount,
    optimizedCount: files.length,
    skippedCount: svgCount - files.length,
  };
}
