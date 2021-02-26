import type { OptimizeProjectData, OutputName } from "./types";

import * as core from "@actions/core";

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
  OUTPUT_NAME_DID_OPTIMIZE,
  OUTPUT_NAME_OPTIMIZED_COUNT,
  OUTPUT_NAME_SKIPPED_COUNT,
  OUTPUT_NAME_SVG_COUNT,
} from "./constants";


const outputs: { [key: string]: (data: OptimizeProjectData) => string } = {
  "DID_OPTIMIZE": (data: OptimizeProjectData): string => {
    return `${data.optimizedCount > 0}`;
  },
  "OPTIMIZED_COUNT": (data: OptimizeProjectData): string => {
    return `${data.optimizedCount}`;
  },
  "SKIPPED_COUNT": (data: OptimizeProjectData): string => {
    return `${data.skippedCount}`;
  },
  "SVG_COUNT": (data: OptimizeProjectData): string => {
    return `${data.svgCount}`;
  },
};

function getOutputNamesFor(event: string): OutputName[] {
  switch (event) {
    case EVENT_PULL_REQUEST:
    case EVENT_PUSH:
    case EVENT_SCHEDULE:
      return [
        OUTPUT_NAME_DID_OPTIMIZE,
        OUTPUT_NAME_OPTIMIZED_COUNT,
        OUTPUT_NAME_SKIPPED_COUNT,
        OUTPUT_NAME_SVG_COUNT,
      ];
    default:
      return [];
  }
}


export function setOutputValues(
  event: string,
  data: OptimizeProjectData,
): void {
  const names = getOutputNamesFor(event);
  for (const name of names) {
    // eslint-disable-next-line security/detect-object-injection
    const fn = outputs[name];
    const value = fn(data);
    core.setOutput(name, value);
  }
}
