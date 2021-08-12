import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_REPOSITORY_DISPATCH,
  EVENT_SCHEDULE,
  EVENT_WORKFLOW_DISPATCH,
} from "../constants";

interface Context {
  readonly eventName: string;
}

interface Params {
  readonly context: Context;
}

const CLIENT_REQUIRED_EVENTS: string[] = [
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
];

const SUPPORTED_EVENTS: string[] = [
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_REPOSITORY_DISPATCH,
  EVENT_SCHEDULE,
  EVENT_WORKFLOW_DISPATCH,
];

function isClientRequired(eventName: string): boolean {
  return CLIENT_REQUIRED_EVENTS.includes(eventName);
}

function isEventSupported(params: Params): [string, boolean] {
  const { context } = params;

  const eventName = context.eventName;
  const ok = SUPPORTED_EVENTS.includes(eventName);

  return [eventName, ok];
}

export {
  isClientRequired,
  isEventSupported,
};
