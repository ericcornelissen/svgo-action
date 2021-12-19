import type { error } from "../errors";
import type {
  CommitsListFilesResponse,
  GitHubClient,
  PullsListFilesResponse,
} from "./types";

import errors from "../errors";

const errorMsg = "invalid Client instance";

const StubClient: GitHubClient = {
  commits: {
    listFiles(): Promise<[CommitsListFilesResponse, error]> {
      return Promise.resolve([
        [],
        errors.New(errorMsg),
      ]);
    },
  },
  pulls: {
    listFiles(): Promise<[PullsListFilesResponse, error]> {
      return Promise.resolve([
        [],
        errors.New(errorMsg),
      ]);
    },
  },
};

export default StubClient;
