import type { GitHubClient } from "../clients";
import type { error } from "../types";
import type { FilterFn } from "./types";

import errors from "../errors";
import { STATUS_REMOVED } from "./constants";

interface File {
  readonly status: string;
  readonly filename: string;
}

interface Params {
  readonly client: GitHubClient;
  readonly context: PrContext;
}

interface Payload {
  readonly pull_request?: {
    readonly number: number;
  };
}

interface PrContext {
  readonly payload: Payload;
  readonly repo: Repo;
}

interface Repo {
  readonly owner: string;
  readonly repo: string;
}

async function getPrFiles({ client, number, repo }: {
  client: GitHubClient,
  number: number,
  repo: Repo,
}): Promise<[File[], error]> {
  const perPage = 100;

  const allFiles: File[] = [];
  let err: error = null;

  let curPage = 0;
  while (++curPage) {
    const [files, err0] = await client.pulls.listFiles({
      ...repo,
      pullNumber: number,
      page: curPage,
      perPage,
    });

    if (err0 !== null) {
      err = errors.New(`could not get Pull Request #${number} files (${err0})`);
      break;
    }

    allFiles.push(...files);

    if (files.length < perPage) {
      break;
    }
  }

  return [allFiles, err];
}

async function NewPrFilesFilter({
  client,
  context,
}: Params): Promise<[FilterFn, error]> {
  const repo = context.repo;
  const number = context.payload.pull_request?.number;
  if (number === undefined) {
    return [() => false, errors.New("missing Pull Request number")];
  }

  const [pullRequestFiles, err] = await getPrFiles({ client, number, repo });
  if (err !== null) {
    return [() => false, err];
  }

  const allowedFiles = pullRequestFiles
    .filter((entry) => entry.status !== STATUS_REMOVED)
    .map((entry) => entry.filename);

  return [
    (filename) => allowedFiles.includes(filename),
    null,
  ];
}

export default NewPrFilesFilter;
