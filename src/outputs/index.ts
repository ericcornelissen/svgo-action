import type { error, Outputter } from "../types";

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_REPOSITORY_DISPATCH,
  EVENT_SCHEDULE,
  EVENT_WORKFLOW_DISPATCH,
} from "./constants";

interface Context {
  readonly eventName: string;
}

interface Environment {
  readonly context: Context;
}

interface OptimizedProjectStats {
  readonly optimizedCount: number;
  readonly svgCount: number;
}

interface Params {
  readonly env: Environment;
  readonly data: OptimizedProjectStats;
  readonly out: Outputter;
}

type DataToOutput = (data: OptimizedProjectStats) => string;

const enum OutputName {
  DID_OPTIMIZE = "DID_OPTIMIZE",
  OPTIMIZED_COUNT = "OPTIMIZED_COUNT",
  SVG_COUNT = "SVG_COUNT",
}

const outputsMap: Map<OutputName, DataToOutput> = new Map([
  [
    OutputName.DID_OPTIMIZE,
    (data) => `${data.optimizedCount > 0}`,
  ],
  [
    OutputName.OPTIMIZED_COUNT,
    (data) => `${data.optimizedCount}`,
  ],
  [
    OutputName.SVG_COUNT,
    (data) => `${data.svgCount}`,
  ],
]);

function getOutputNamesFor(event: string): [OutputName[], error] {
  switch (event) {
    case EVENT_PULL_REQUEST:
    case EVENT_PUSH:
    case EVENT_REPOSITORY_DISPATCH:
    case EVENT_SCHEDULE:
    case EVENT_WORKFLOW_DISPATCH:
      return [[
        OutputName.DID_OPTIMIZE,
        OutputName.OPTIMIZED_COUNT,
        OutputName.SVG_COUNT,
      ], null];
    default:
      return [[], `unknown event ${event}`];
  }
}

function Set({ env, data, out }: Params): error {
  const [names, err] = getOutputNamesFor(env.context.eventName);
  for (const name of names) {
    const fn = outputsMap.get(name) as DataToOutput;
    const value = fn(data);
    out.setOutput(name, value);
  }

  return err;
}

export default {
  Set,
};
