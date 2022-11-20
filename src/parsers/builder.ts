import type { error } from "../errors";
import type { ParseFn, SafeParseFn } from "./types";

import errors from "../errors";

function buildSafeParser<T>(parseFn: ParseFn<T>): SafeParseFn<T> {
  return (raw: string): [T, error] => {
    let parsed: T = { } as T; // type-coverage:ignore-line
    let err: error = null;

    try {
      parsed = parseFn(raw);
    } catch (thrownError) {
      err = errors.New(`parse error (${thrownError})`);
    }

    return [parsed, err];
  };
}

export {
  buildSafeParser,
};
