import type { error } from "../types";

import errors from "../errors";

type parseFn<T> = (raw: string) => T;
type normalizedParseFn<T> = (raw: string) => [T, error];

function buildParser<T>(parse: parseFn<T>): normalizedParseFn<T> {
  return function (raw: string): [T, error] {
    let options: unknown = {};
    let err: error = null;

    try {
      options = parse(raw);
    } catch (thrownError) {
      err = errors.New(`invalid source (${thrownError})`);
    }

    return [options as T, err];
  };
}

export {
  buildParser,
};
