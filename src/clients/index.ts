// SPDX-License-Identifier: MIT

import type { GitHub, GitHubClient, Inputter } from "./types";
import type { error } from "../errors";

import Client from "./client";
import { INPUT_NAME_REPO_TOKEN } from "./constants";
import StubClient from "./stub";
import errors from "../errors";

interface Params {
  readonly github: GitHub;
  readonly inp: Inputter;
}

function New({ github, inp }: Params): [GitHubClient, error] {
  let client: GitHubClient = StubClient;
  let err: error = null;

  try {
    const token = inp.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
    const octokit = github.getOctokit(token);
    client = new Client(octokit);
  } catch (_) {
    err = errors.New(`missing ${INPUT_NAME_REPO_TOKEN}`);
  }

  return [client, err];
}

export default {
  New,
};

export type {
  GitHubClient,
};
