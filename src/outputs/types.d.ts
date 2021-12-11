import type { error, Outputter } from "../types";

interface OptimizedProjectStats {
  readonly optimizedCount: number;
  readonly svgCount: number;
}

interface Outputter {
  setOutput(name: string, value: string): void;
}

export type {
  error,
  OptimizedProjectStats,
  Outputter,
};
