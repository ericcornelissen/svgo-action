interface OptimizedProjectStats {
  readonly optimizedCount: number;
  readonly svgCount: number;
}

interface Outputter {
  setOutput(name: string, value: string): void;
}

export type {
  OptimizedProjectStats,
  Outputter,
};
