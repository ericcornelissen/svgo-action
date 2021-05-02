import type { Outputter, OptimizeProjectData } from "./types";

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
} from "./constants";

type DataToOutput = (data: OptimizeProjectData) => string;

const enum OutputName {
  DID_OPTIMIZE = "DID_OPTIMIZE",
  OPTIMIZED_COUNT = "OPTIMIZED_COUNT",
  SKIPPED_COUNT = "SKIPPED_COUNT",
  SVG_COUNT = "SVG_COUNT",
}

const outputsMap: Map<OutputName, DataToOutput> = new Map([
  [
    OutputName.DID_OPTIMIZE,
    (data: OptimizeProjectData): string => `${data.optimizedCount > 0}`,
  ],
  [
    OutputName.OPTIMIZED_COUNT,
    (data: OptimizeProjectData): string => `${data.optimizedCount}`,
  ],
  [
    OutputName.SKIPPED_COUNT,
    (data: OptimizeProjectData): string => `${data.skippedCount}`,
  ],
  [
    OutputName.SVG_COUNT,
    (data: OptimizeProjectData): string => `${data.svgCount}`,
  ],
]);

function getOutputNamesFor(event: string): OutputName[] {
  switch (event) {
    case EVENT_PULL_REQUEST:
    case EVENT_PUSH:
    case EVENT_SCHEDULE:
      return [
        OutputName.DID_OPTIMIZE,
        OutputName.OPTIMIZED_COUNT,
        OutputName.SKIPPED_COUNT,
        OutputName.SVG_COUNT,
      ];
    default:
      return [];
  }
}

export function setOutputValues(
  outputs: Outputter,
  event: string,
  data: OptimizeProjectData,
): void {
  const names = getOutputNamesFor(event);
  for (const name of names) {
    const fn = outputsMap.get(name) as DataToOutput;
    const value = fn(data);
    outputs.setOutput(name, value);
  }
}
