// SPDX-License-Identifier: MIT

import type { error } from "../errors";

interface FileHandle {
  readonly path: string;
}

interface FileSystem {
  listFiles(): Iterable<FileHandle>;
  readFile(file: FileHandle): Promise<[string, error]>;
  writeFile(file: FileHandle, content: string): Promise<error>;
}

interface OptimizeProjectData {
  readonly optimizedCount: number;
  readonly svgCount: number;
}

interface OptimizedFileHandle {
  readonly content: string;
  readonly optimizedContent: string;
}

interface Optimizer {
  optimize(s: string): Promise<[string, error]>;
}

export type {
  FileHandle,
  FileSystem,
  OptimizeProjectData,
  OptimizedFileHandle,
  Optimizer,
};
