import type { GitHub, GitHubClient } from "./types";
import type { error } from "../errors";

import { EVENT_PULL_REQUEST, EVENT_PUSH } from "./constants";
import filters from "../filters";

interface Config {
  readonly ignoreGlobs: {
    readonly value: Iterable<string>;
  };
}

type Filter = (s: string) => boolean;

interface Params {
  readonly client: GitHubClient;
  readonly config: Config;
  readonly github: GitHub;
}

async function getFilters({
  client,
  config,
  github,
}: Params): Promise<[Iterable<Filter>, error]> {
  const context = github.context;
  const event = context.eventName;

  const result = [
    ...Array.from(config.ignoreGlobs.value).map(filters.NewGlobFilter),
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

export type {
  Config,
};
