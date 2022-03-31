import type { SafeParseFn } from "./types";

import jsEval from "eval";
import * as yaml from "js-yaml";

import { buildSafeParser } from "./builder";

function NewJavaScript(): SafeParseFn<unknown> {
  return buildSafeParser(jsEval);
}

function NewYaml(): SafeParseFn<unknown> {
  return buildSafeParser(yaml.load);
}

export default {
  NewJavaScript,
  NewYaml,
};
