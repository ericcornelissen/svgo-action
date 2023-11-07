// SPDX-License-Identifier: MIT

import type { FilterFn } from "./types";
import type { error } from "../errors";

import { STATUS_REMOVED } from "./constants";
import errors from "../errors";

interface Client {
  readonly commits: {
    listFiles(options: ListFilesOptions): Promise<[Iterable<File>, error]>;
  };
}

interface Commit {
  readonly id: string;
}

interface File {
  readonly filename: string;
  readonly status: string;
}

type ListFilesOptions = {
  ref: string;
} & Repo;

interface Params {
  readonly client: Client;
  readonly context: PushContext;
}

interface Payload {
  readonly commits?: Iterable<Commit>;
}

interface PushContext {
  readonly payload: Payload;
  readonly repo: Repo;
}

interface Repo {
  readonly owner: string;
  readonly repo: string;
}

async function getPushedFiles({ client, commits, repo }: {
  client: Client;
  commits: Iterable<Commit>;
  repo: Repo;
}): Promise<[File[], error]> {
  const allFiles: File[] = [];
  let err: error = null;

  for (const commit of commits) {
    const [files, err0] = await client.commits.listFiles({
      ...repo,
      ref: commit.id,
    });

    if (err0 !== null) {
      err = errors.New(`could not get commit '${commit.id}' (${err0})`);
      break;
    }

    allFiles.push(...files);
  }

  return [allFiles, err];
}

async function NewPushedFilesFilter({
  client,
  context,
}: Params): Promise<[FilterFn, error]> {
  const repo = context.repo;
  const commits = context.payload.commits;
  if (commits === undefined) {
    return [() => false, errors.New("missing commits")];
  }

  const [pushedFiles, err] = await getPushedFiles({ client, commits, repo });
  if (err !== null) {
    return [() => false, err];
  }

  const allowedFiles = pushedFiles
    .filter((entry) => entry.status !== STATUS_REMOVED)
    .map((entry) => entry.filename);

  return [
    (filename) => allowedFiles.includes(filename),
    null,
  ];
}

export default NewPushedFilesFilter;

export type {
  PushContext,
};
