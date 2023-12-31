// SPDX-License-Identifier: MIT

import _jsEval from "eval";

function jsEval(raw: string) {
  // Parsing JavaScript code with the "eval" package when no filename is
  // provided fails due to an outdated reference to `module` that is invalid in
  // modern JavaScript.
  // See https://github.com/ericcornelissen/svgo-action/issues/548 for more
  // information.
  const jsEvalFilename = "x";
  return _jsEval(raw, jsEvalFilename);
}

export {
  jsEval,
};
