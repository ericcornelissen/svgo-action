import type { error } from "../types";

type ParseFn<OutType> = (raw: string) => OutType;

type SafeParseFn<OutType> = (raw: string) => [OutType, error];

export type {
  error,
  ParseFn,
  SafeParseFn,
};
