import type { GitHubClient } from "../clients";
import type { error, Context } from "../types";
import type { FileHandle, FileSystem } from "./types";

import * as fs from "fs";
import * as path from "path";

import { EVENTS } from "../constants";
import errors from "../errors";
import NewBaseFileSystem from "./base";
import NewFilteredFileSystem from "./filtered";

interface Params {
  readonly client: GitHubClient;
  readonly context: Context;
}

const newStandard = (): FileSystem => NewBaseFileSystem({ fs, path });

type FileFilter = (filepath: string) => boolean;

interface PrContext {
  readonly payload: {
    readonly pull_request: {
      readonly number: number;
    };
  };
  readonly repo: {
    readonly owner: string;
    readonly repo: string;
  };
}

async function getPullFilter(
  client: GitHubClient,
  context: PrContext,
): Promise<[FileFilter, error]> {
  const perPage = 100;

  const prFiles: string[] = [];
  let err: error = null;

  let curPage = 0;
  while (++curPage) {
    const [data, err0] = await client.pulls.listFiles({
      ...context.repo,
      pullNumber: context.payload.pull_request.number,
      page: curPage,
      perPage,
    });

    if (err0 !== null) {
      err = errors.New(`Could not get Pull Request files (${err0})`);
      break;
    }

    const files = data
      .filter((entry) => entry.status !== "removed")
      .map((entry) => entry.filename);
      prFiles.push(...files);

    if (data.length < perPage) {
      break;
    }
  }

  return [(filepath) => prFiles.includes(filepath), err];
}

interface PushContext {
  readonly payload: {
    readonly commits: {
      id: string;
    }[];
  };
  readonly repo: {
    readonly owner: string;
    readonly repo: string;
  };
}

async function getPushFilter(
  client: GitHubClient,
  context: PushContext,
): Promise<[FileFilter, error]> {
  const pushedFiles: string[] = [];
  let err: error = null;

  for (const commit of context.payload.commits) {
    const [data, err0] = await client.commits.listFiles({
      ...context.repo,
      ref: commit.id,
    });

    if (err0 !== null) {
      err = errors.New(`Could not get commit '${commit.id}' (${err0})`);
      break;
    }

    const files = data
      .filter((entry) => entry.status !== "removed")
      .map((entry) => entry.filename);
      pushedFiles.push(...files);
  }

  return [(filepath) => pushedFiles.includes(filepath), err];
}

async function New({ client, context }: Params): Promise<[FileSystem, error]> {
  let fs = newStandard();
  let err: error = null;
  switch (context.eventName) {
    case EVENTS.pullRequest:
      // eslint-disable-next-line no-case-declarations
      const [f1, err1] = await getPullFilter(client, context as PrContext);
      fs = NewFilteredFileSystem({ fs, filters: [f1] });
      err = err1;
      break;
    case EVENTS.push:
      // eslint-disable-next-line no-case-declarations
      const [f2, err2] = await getPushFilter(client, context as PushContext);
      fs = NewFilteredFileSystem({ fs, filters: [f2] });
      err = err2;
      break;
    default:
      break;
  }

  return [fs, err];
}

export default {
  New,
  NewStandard: newStandard,
};

export type {
  FileHandle,
  FileSystem,
};
