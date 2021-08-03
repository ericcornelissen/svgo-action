import type { error, Outputter } from "../types";

import { EVENTS } from "../constants";

interface Context {
  readonly eventName: string;
}

interface OptimizedProjectStats {
  readonly optimizedCount: number;
  readonly svgCount: number;
}

interface Params {
  readonly context: Context;
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
    case EVENTS.pullRequest:
    case EVENTS.push:
    case EVENTS.repositoryDispatch:
    case EVENTS.schedule:
    case EVENTS.workflowDispatch:
      return [[
        OutputName.DID_OPTIMIZE,
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