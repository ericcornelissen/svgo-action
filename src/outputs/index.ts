// SPDX-License-Identifier: MIT

import type { OptimizedProjectStats, Outputter } from "./types";
import type { error } from "../errors";

import { getOutputNamesFor } from "./names";
import { getValuesForOutputs } from "./values";
import { writeOutputs } from "./write";

interface Context {
  readonly eventName: string;
}

interface Environment {
  readonly context: Context;
}

interface Params {
  readonly data: OptimizedProjectStats;
  readonly env: Environment;
  readonly out: Outputter;
}

function Set({ env, data, out }: Params): error {
  const eventName = env.context.eventName;

  const [names, err] = getOutputNamesFor(eventName);
  const outputNameToValue = getValuesForOutputs(names, data);
  writeOutputs(out, outputNameToValue);

  return err;
}

export default {
  Set,
};

export type {
  Outputter,
};
