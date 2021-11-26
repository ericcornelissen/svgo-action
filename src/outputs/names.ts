import type { error } from "../types";

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_REPOSITORY_DISPATCH,
  EVENT_SCHEDULE,
  EVENT_WORKFLOW_DISPATCH,
} from "./constants";

const enum OutputName {
  DID_OPTIMIZE = "DID_OPTIMIZE",
  OPTIMIZED_COUNT = "OPTIMIZED_COUNT",
  SVG_COUNT = "SVG_COUNT",
}

function getOutputNamesFor(event: string): [OutputName[], error] {
  switch (event) {
  case EVENT_PULL_REQUEST:
  case EVENT_PUSH:
  case EVENT_REPOSITORY_DISPATCH:
  case EVENT_SCHEDULE:
  case EVENT_WORKFLOW_DISPATCH:
  default:
    return [[
      OutputName.DID_OPTIMIZE,
      OutputName.OPTIMIZED_COUNT,
      OutputName.SVG_COUNT,
    ], null];
  }
}

export {
  getOutputNamesFor,
  OutputName,
};
