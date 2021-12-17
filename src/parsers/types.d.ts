import type { error } from "../errors";

type ParseFn<OutType> = (raw: string) => OutType;

type SafeParseFn<OutType> = (raw: string) => [OutType, error];

export type {
  ParseFn,
  SafeParseFn,
};
