import * as core from "@actions/core";
import * as github from "@actions/github";

import main from "./main";

main({
  core,
  github,
});
