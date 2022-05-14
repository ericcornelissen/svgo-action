import type { SafeParseFn } from "./types";

import { buildSafeParser } from "./builder";
import { jsEval, yamlEval } from "./eval";

function NewJavaScript(): SafeParseFn<unknown> {
  return buildSafeParser(jsEval);
}

function NewYaml(): SafeParseFn<unknown> {
  return buildSafeParser(yamlEval);
}

export default {
  NewJavaScript,
  NewYaml,
};
