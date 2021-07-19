import type { error, Inputter } from "../types";
import type { GitHubClient, Octokit } from "./types";

import { INPUT_NAME_REPO_TOKEN } from "../constants";
import errors from "../errors";
import Client from "./client";

interface Params {
  readonly github: {
    getOctokit(token: string): Octokit;
  };
  readonly inp: Inputter;
}

function New({ github, inp }: Params): [GitHubClient, error] {
  let client: GitHubClient = { } as GitHubClient;
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
