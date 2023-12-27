// SPDX-License-Identifier: MIT

import * as core from "@actions/core";
import * as github from "@actions/github";

import { EVENT_SCHEDULE } from "./constants";
import main from "./main";

if (process.env.SVGO_ACTION_CI_TEST) {
  github.context.eventName = EVENT_SCHEDULE;
}

main({
  core,
  github,
});
