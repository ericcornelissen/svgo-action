import * as core from "@actions/core";
import * as github from "@actions/github";

import prs from "./main";

const EVENT_PULL_REQUEST = "pull_request";
const EVENT_PUSH = "push";

export default async function main(): Promise<void> {
  const event = github.context.eventName;
  switch (event) {
    case EVENT_PUSH:
      core.info("Running SVGO-Action in Pull Request context");
      core.setFailed("NOT YET SUPPORTED");
      break;
    case EVENT_PULL_REQUEST:
      core.info("Running SVGO-Action in Pull Request context");
      await prs();
      break;
    default:
      core.setFailed(`Event '${event}' not supported by the SVGO-Action`);
  }
}

main();
