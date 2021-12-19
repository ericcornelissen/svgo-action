import type { error } from "../errors";
import type {
  FileSystem,
  OptimizeProjectData,
  Optimizer,
} from "./types";

import errors from "../errors";
import { len } from "../utils";
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
      optimizedCount: len(optimizedFiles),
      svgCount: len(files),
    },
    errors.Combine(readError, optimizeError, writeError),
  ];
}

export default {
  Files,
};
