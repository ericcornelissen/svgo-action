import { SUPPORTED_EVENTS } from "../constants";

type Context = {
  readonly eventName: string;
};

function isEventSupported(params: {
  context: Context,
}): [string, boolean] {
  const { context } = params;

  const eventName = context.eventName;
  const ok = SUPPORTED_EVENTS.includes(eventName);

  return [eventName, ok];
}

export default isEventSupported;
