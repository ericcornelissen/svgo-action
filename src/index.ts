import type { Octokit } from "@octokit/core";

import * as core from "@actions/core";
import * as github from "@actions/github";

import { INPUT_NAME_REPO_TOKEN, INPUT_REQUIRED } from "./constants";
import main from "./main";

const token: string = core.getInput(INPUT_NAME_REPO_TOKEN, INPUT_REQUIRED);
const client: Octokit = github.getOctokit(token);

main(client);
