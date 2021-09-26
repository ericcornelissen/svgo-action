import type { Condition } from "./types";

function runIf(condition: Condition, fn: () => void): void {
  if (typeof condition === "boolean") {
    if (condition) {
      fn();
    }
  } else if (condition !== null) {
    fn();
  }
}

export {
  runIf,
};
