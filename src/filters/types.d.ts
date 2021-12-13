import type { error } from "../types";

type FilterFn = (filepath: string) => boolean;

export type {
  error,
  FilterFn,
};
