import * as yaml from "js-yaml";
import nodeEval from "node-eval";

import { buildParser } from "./builder";

const parseJavaScript = buildParser(nodeEval);
const parseYaml = buildParser(yaml.load);

export {
  parseJavaScript,
  parseYaml,
};
