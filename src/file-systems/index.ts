import type { GitHubClient } from "../clients";
import type { error, Context } from "../types";
import type { FileInfo, FileSystem } from "./types";
import type { PrContext } from "./pr";

import * as path from "path";

import { EVENTS } from "../constants";
import { BaseFileSystem } from "./base";
import { createPrFileSystemBuilder } from "./pr";

interface Params {
  readonly client: GitHubClient;
  readonly context: Context;
}

const newPullRequest = createPrFileSystemBuilder({ fs: BaseFileSystem, path });
const newStandard = (): FileSystem => BaseFileSystem;

async function New({ client, context }: Params): Promise<[FileSystem, error]> {
  let fileSystem: FileSystem;
  let err: error = null;
  switch (context.eventName) {
    case EVENTS.pullRequest:
      [fileSystem, err] = await newPullRequest(client, context as PrContext);
      break;
    default:
      fileSystem = newStandard();
      break;
  }

  return [fileSystem, err];
}

export default {
  New,
  NewStandard: newStandard,
};

export type {
  FileInfo,
  FileSystem,
};
