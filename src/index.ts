import * as github from "@actions/github";
import * as core from "@actions/core";

import main from "./main";

const token = core.getInput("repo-token", { required: true });
const client = github.getOctokit(token);

main(core, client, github.context);
