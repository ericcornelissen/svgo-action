import type { error } from "../errors";
import type {
  FileSystem,
  OptimizeProjectData,
  Optimizer,
} from "./types";

import errors from "../errors";
import { optimizeAll } from "./optimize";
import { readFiles } from "./read";
import { writeFiles } from "./write";

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

function size<T>(collection: Iterable<T>): number {
  return Array.from(collection).length;
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
      optimizedCount: size(optimizedFiles),
      svgCount: size(files),
    },
    errors.Combine(readError, optimizeError, writeError),
  ];
}

export default {
  Files,
};
