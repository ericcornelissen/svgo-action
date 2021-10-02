import type { GitHubClient } from "../clients";
import type { error, GitHub } from "../types";

import filters from "../filters";
import { EVENT_PULL_REQUEST, EVENT_PUSH } from "./constants";

interface Config {
  readonly ignoreGlobs: {
    readonly value: string[];
  };
}

interface Params {
  readonly client: GitHubClient;
  readonly config: Config;
  readonly github: GitHub;
}

async function getFilters({
  client,
  config,
  github,
}: Params): Promise<[((s: string) => boolean)[], error]> {
  const { context } = github;
  const event = context.eventName;

  const result = [
    ...config.ignoreGlobs.value.map(filters.NewGlobFilter),
    filters.NewSvgsFilter(),
  ];

  let err: error = null;
  if (event === EVENT_PULL_REQUEST && !process.env.SVGO_ACTION_E2E_TEST) {
    const [f, err0] = await filters.NewPrFilesFilter({ client, context });
    result.push(f);
    err = err0;
  } else if (event === EVENT_PUSH && !process.env.SVGO_ACTION_E2E_TEST) {
    const [f, err1] = await filters.NewPushedFilesFilter({ client, context });
    result.push(f);
    err = err1;
  }

  return [result, err];
}

export {
  getFilters,
};
