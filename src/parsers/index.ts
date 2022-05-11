import type { SafeParseFn } from "./types";

import _jsEval from "eval";
import * as yaml from "js-yaml";

import { buildSafeParser } from "./builder";

// Parsing JavaScript code with the "eval" package when no filename is provided
// fails due to an outdated reference to `module` that is invalid in modern
// JavaScript.
// See https://github.com/ericcornelissen/svgo-action/issues/548 for more
// information.
const jsEvalFilename = "x";

function NewJavaScript(): SafeParseFn<unknown> {
  const jsEval = (raw: string) => _jsEval(raw, jsEvalFilename);
  return buildSafeParser(jsEval);
}

function NewYaml(): SafeParseFn<unknown> {
  return buildSafeParser(yaml.load);
}

export default {
  NewJavaScript,
  NewYaml,
};
