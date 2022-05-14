import _jsEval from "eval";
import * as yaml from "js-yaml";

function jsEval(raw: string) {
  // Parsing JavaScript code with the "eval" package when no filename is
  // provided fails due to an outdated reference to `module` that is invalid in
  // modern JavaScript.
  // See https://github.com/ericcornelissen/svgo-action/issues/548 for more
  // information.
  const jsEvalFilename = "x";
  return _jsEval(raw, jsEvalFilename);
}

function yamlEval(raw: string) {
  return yaml.load(raw);
}

export {
  jsEval,
  yamlEval,
};
