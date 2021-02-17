/* eslint-disable security/detect-non-literal-fs-filename */

import { FileInfo, FileSystem } from "./file-system";
import { ActionConfig } from "./inputs";
import { SVGOptimizer } from "./svgo";

async function optimize(
  fs: FileSystem,
  svgo: SVGOptimizer,
  file: FileInfo,
): Promise<void> {
  const originalContent = await fs.readFile(file);
  const optimizedContent = await svgo.optimize(originalContent);
  await fs.writeFile(file, optimizedContent);
}

export default async function main(
  fs: FileSystem,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  const promises: Promise<void>[] = [];
  for (const file of fs.listFiles(".", true)) {
    if (file.extension !== ".svg") {
      continue;
    }

    const filePromise = optimize(fs, svgo, file);
    promises.push(filePromise);
  }

  await Promise.all(promises);
}
