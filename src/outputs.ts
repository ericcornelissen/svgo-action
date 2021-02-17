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


function getOutputValueFor(
  name: OutputName,
  data: OptimizeProjectData,
): string {
  switch (name) {
    case OUTPUT_NAME_DID_OPTIMIZE:
      return `${data.optimizedCount > 0}`;
    case OUTPUT_NAME_OPTIMIZED_COUNT:
      return `${data.optimizedCount}`;
    case OUTPUT_NAME_SKIPPED_COUNT:
      return `${data.skippedCount}`;
    case OUTPUT_NAME_SVG_COUNT:
      return `${data.svgCount}`;
  }
}


export function getOutputNamesFor(event: string): OutputName[] {
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
  names: OutputName[],
  data: OptimizeProjectData,
): void {
  for (const name of names) {
    const value = getOutputValueFor(name, data);
    core.setOutput(name, value);
  }
}
