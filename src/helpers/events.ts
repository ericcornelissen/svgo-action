import { SUPPORTED_EVENTS } from "../constants";

interface Context {
  readonly eventName: string;
}

interface Params {
  readonly context: Context;
}

function isEventSupported(params: Params): [string, boolean] {
  const { context } = params;

  const eventName = context.eventName;
  const ok = SUPPORTED_EVENTS.includes(eventName);

  return [eventName, ok];
}

export default isEventSupported;
