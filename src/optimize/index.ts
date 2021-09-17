import type { FileSystem } from "../file-systems";
import type { error } from "../types";
import type { OptimizeProjectData, Optimizer } from "./types";

import errors from "../errors";
import { optimizeAll } from "./optimize";
import { readFiles } from "./read";
import { writeFiles } from "./write";

interface Params {
  readonly fs: FileSystem;
  readonly config: {
    readonly isDryRun: {
      readonly value: boolean;
    };
  };
  readonly optimizer: Optimizer;
}

async function Files({
  config,
  fs,
  optimizer,
}: Params): Promise<[OptimizeProjectData, error]> {
  const [files, readError] = await readFiles(fs);
  const [optimizedFiles, optimizeError] = await optimizeAll(optimizer, files);

  let writeError: error = null;
  if (!config.isDryRun.value) {
    writeError = await writeFiles(fs, optimizedFiles);
  }

  return [
    {
      optimizedCount: optimizedFiles.length,
      svgCount: files.length,
    },
    errors.Combine(readError, optimizeError, writeError),
  ];
}

export default {
  Files,
};
