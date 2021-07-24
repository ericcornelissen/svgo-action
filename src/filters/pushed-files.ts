import type { GitHubClient } from "../clients";
import type { error } from "../types";

import errors from "../errors";

interface File {
  readonly status: string;
  readonly filename: string;
}

interface Params {
  readonly client: GitHubClient;
  readonly context: PushContext;
}

interface Commit {
  id: string;
}

interface PushContext {
  readonly payload: {
    readonly commits?: Commit[];
  };
  readonly repo: Repo;
}

interface Repo {
  readonly owner: string;
  readonly repo: string;
}

type FilterFn = (filepath: string) => boolean;

const STATUS_REMOVED = "removed";

async function getPushedFiles({ client, commits, repo }: {
  client: GitHubClient,
  commits: Commit[],
  repo: Repo,
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
