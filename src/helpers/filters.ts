import type { GitHubClient } from "../clients";
import type { error, GitHub } from "../types";

import { EVENT_PULL_REQUEST, EVENT_PUSH } from "../constants";
import filters from "../filters";

interface Config {
  readonly ignoreGlob: string;
}

interface Params {
  readonly client: GitHubClient;
  readonly config: Config;
  readonly event: string;
  readonly github: GitHub;
}

async function getFilters({
  client,
  config,
  event,
  github,
}: Params): Promise<[((s: string) => boolean)[], error]> {
  const { context } = github;

  const result = [
    filters.NewGlobFilter(config.ignoreGlob),
    filters.NewSvgsFilter(),
  ];

  let err: error = null;
  if (event === EVENT_PULL_REQUEST) {
    const [f, err0] = await filters.NewPrFilesFilter({ client, context });
    result.push(f);
    err = err0;
  } else if (event === EVENT_PUSH) {
    const [f, err1] = await filters.NewPushedFilesFilter({ client, context });
    result.push(f);
    err = err1;
  }

  return [result, err];
}

export {
  getFilters,
};
