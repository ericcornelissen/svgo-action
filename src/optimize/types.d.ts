import type { FileHandle } from "../file-systems";
import type { error } from "../types";

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
  Optimizer,
  OptimizedFileHandle,
  ReadFileHandle,
};
