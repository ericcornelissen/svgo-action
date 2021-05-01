// Action events
export const EVENT_PULL_REQUEST = "pull_request";
export const EVENT_PUSH = "push";
export const EVENT_REPOSITORY_DISPATCH = "repository_dispatch";
export const EVENT_SCHEDULE = "schedule";
export const EVENT_WORKFLOW_DISPATCH = "workflow_dispatch";
export const SUPPORTED_EVENTS: string[] = [
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_REPOSITORY_DISPATCH,
  EVENT_SCHEDULE,
  EVENT_WORKFLOW_DISPATCH,
];

// Action inputs
export const INPUT_NAME_DRY_RUN = "dry-run";
export const INPUT_NAME_IGNORE = "ignore";
export const INPUT_NAME_SVGO_OPTIONS = "svgo-options";
export const INPUT_NAME_SVGO_VERSION = "svgo-version";
export const INPUT_NOT_REQUIRED = { required: false };

// Action defaults
export const DEFAULT_SVGO_OPTIONS = "svgo.config.js";

// Action outputs
export const OUTPUT_NAME_DID_OPTIMIZE = "DID_OPTIMIZE";
export const OUTPUT_NAME_OPTIMIZED_COUNT = "OPTIMIZED_COUNT";
export const OUTPUT_NAME_SKIPPED_COUNT = "SKIPPED_COUNT";
export const OUTPUT_NAME_SVG_COUNT = "SVG_COUNT";
