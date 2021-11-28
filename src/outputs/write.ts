import type { Outputter } from "../types";
import type { OutputName } from "./names";

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
