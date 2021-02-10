import { Octokit } from "@octokit/core";
import * as path from "path";
import * as fs from "fs";

import {
  OUTPUT_NAME_DID_OPTIMIZE,
  OUTPUT_NAME_OPTIMIZED_COUNT,
  OUTPUT_NAME_SKIPPED_COUNT,
  OUTPUT_NAME_SVG_COUNT,
} from "../constants";
import { ActionConfig } from "../inputs";
import { SVGOptimizer } from "../svgo";
import { OutputName } from "../types";
import { setOutputValues } from "./common";


const OUTPUT_NAMES: OutputName[] = [
  OUTPUT_NAME_DID_OPTIMIZE,
  OUTPUT_NAME_OPTIMIZED_COUNT,
  OUTPUT_NAME_SKIPPED_COUNT,
  OUTPUT_NAME_SVG_COUNT,
];

function* listFilesRecursively(dirPath: string) {
  for (const entry of fs.readdirSync(dirPath)) {
    if ([".git"].includes(entry)) {
      continue;
    }

    const entryPath = path.resolve(dirPath, entry);
    if (!fs.existsSync(entryPath)) {
      continue;
    }

    const lstat = fs.lstatSync(entryPath);
    if (lstat.isFile()) {
      yield entryPath;
    } else {
      yield* listFilesRecursively(entryPath);
    }
  }
}

export default async function main(
  _: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  let optimizedCount = 0, svgCount = 0;

  for (const filePath of listFilesRecursively(".")) {
    if (path.extname(filePath) !== ".svg") {
      continue;
    }

    const originalContent = fs.readFileSync(filePath).toString();
    const optimizedContent = await svgo.optimize(originalContent);
    fs.writeFileSync(filePath, optimizedContent);

    optimizedCount++;
    svgCount++;
  }

  setOutputValues({
    fileCount: 0,
    fileData: {
      optimized: [],
      original: [],
    },
    ignoredCount: 0,
    optimizedCount: optimizedCount,
    skippedCount: 0,
    svgCount: svgCount,
    warnings: [],
  }, OUTPUT_NAMES);
}
