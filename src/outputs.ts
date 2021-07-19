import type { error, Outputter } from "./types";

import { EVENTS } from "./constants";

type DataToOutput = (data: OptimizedProjectStats) => string;

interface OptimizedProjectStats {
  readonly ignoredCount: number;
  readonly optimizedCount: number;
  readonly svgCount: number;
}

interface Context {
  readonly eventName: string;
}

interface Params {
  readonly context: Context;
  readonly data: OptimizedProjectStats;
  readonly out: Outputter;
}

const enum OutputName {
  DID_OPTIMIZE = "DID_OPTIMIZE",
  IGNORED_COUNT = "IGNORED_COUNT",
  OPTIMIZED_COUNT = "OPTIMIZED_COUNT",
  SVG_COUNT = "SVG_COUNT",
}

const outputsMap: Map<OutputName, DataToOutput> = new Map([
  [
    OutputName.DID_OPTIMIZE,
    (data) => `${data.optimizedCount > 0}`,
  ],
  [
    OutputName.IGNORED_COUNT,
    (data) => `${data.ignoredCount}`,
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
    case EVENTS.pullRequest:
    case EVENTS.push:
    case EVENTS.schedule:
      return [[
        OutputName.DID_OPTIMIZE,
        OutputName.IGNORED_COUNT,
        OutputName.OPTIMIZED_COUNT,
        OutputName.SVG_COUNT,
      ], null];
    default:
      return [[], `unknown event ${event}`];
  }
}

function setOutputValues({ context, data, out }: Params): error {
  const [names, err] = getOutputNamesFor(context.eventName);
  for (const name of names) {
    const fn = outputsMap.get(name) as DataToOutput;
    const value = fn(data);
    out.setOutput(name, value);
  }

  return err;
}

export {
  setOutputValues,
};
