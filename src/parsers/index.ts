import type { SafeParseFn } from "./types";

import { buildSafeParser } from "./builder";
import { jsEval } from "./eval";

function NewJavaScript(): SafeParseFn<unknown> {
  return buildSafeParser(jsEval);
}

export default {
  NewJavaScript,
};
