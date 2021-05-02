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
