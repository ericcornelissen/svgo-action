import * as core from "@actions/core";
import * as github from "@actions/github";

import { EVENT_SCHEDULE } from "./constants";
import main from "./main";

if (process.env.SVGO_ACTION_E2E_TEST) {
  github.context.eventName = EVENT_SCHEDULE;
}

core.notice(`General support for SVGO Action v2 ends on 2022-05-31 and security
updates will be supported until 2023-04-30. Please upgrade to SVGO Action v3 as
soon as possible.`);

main({
  core,
  github,
});
