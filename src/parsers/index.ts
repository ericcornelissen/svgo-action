import type { SafeParseFn } from "./types";

import * as yaml from "js-yaml";
import nodeEval from "node-eval";

import { buildSafeParser } from "./builder";

function NewJavaScript(): SafeParseFn<unknown> {
  return buildSafeParser(nodeEval);
}

function NewYaml(): SafeParseFn<unknown> {
  return buildSafeParser(yaml.load);
}

export default {
  NewJavaScript,
  NewYaml,
};
