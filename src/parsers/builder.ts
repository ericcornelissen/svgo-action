import type { error } from "../types";
import type { ParseFn, SafeParseFn } from "./types";

import errors from "../errors";

function buildSafeParser<T>(parseFn: ParseFn<T>): SafeParseFn<T> {
  return (raw: string): [T, error] => {
    let options: T = { } as T;
    let err: error = null;

    try {
      options = parseFn(raw);
    } catch (thrownError) {
      err = errors.New(`parse error (${thrownError})`);
    }

    return [options, err];
  };
}

export {
  buildSafeParser,
};
