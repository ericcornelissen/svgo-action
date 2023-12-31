// SPDX-License-Identifier: MIT

import type { OutputName } from "./names";
import type { Outputter } from "./types";

function writeOutputs(
  out: Outputter,
  outputNameToValue: Map<OutputName, string>,
): void {
  for (const [name, value] of outputNameToValue) {
    out.setOutput(name, value);
  }
}

export {
  writeOutputs,
};
