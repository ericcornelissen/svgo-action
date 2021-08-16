import type { FileHandle } from "../file-systems";
import type { error } from "../types";

interface OptimizeProjectData {
  readonly optimizedCount: number;
  readonly svgCount: number;
}

interface Optimizer {
  optimize(s: string): Promise<[string, error]>;
}

interface OptimizedFileHandle extends ReadFileHandle {
  readonly optimizedContent: string;
}

interface ReadFileHandle extends FileHandle {
  readonly content: string;
}

export type {
  OptimizeProjectData,
  Optimizer,
  OptimizedFileHandle,
  ReadFileHandle,
};
