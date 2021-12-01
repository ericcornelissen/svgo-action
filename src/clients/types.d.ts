import type { error } from "../types";

interface CommitsGetCommitParams {
  readonly owner: string;
  readonly ref: string;
  readonly repo: string;
}

interface CommitsGetCommitResponse {
  readonly files: GitFileInfo[];
}

type CommitsListFilesParams = CommitsGetCommitParams;

type CommitsListFilesResponse = GitFileInfo[];

interface GitFileInfo {
  readonly filename: string;
  readonly status: string;
}

interface GitHubClient {
  readonly commits: {
    listFiles(
      params: CommitsListFilesParams,
    ): Promise<[CommitsListFilesResponse, error]>;
  };
  readonly pulls: {
    listFiles(
      params: PullsListFilesParams,
    ): Promise<[PullsListFilesResponse, error]>;
  };
}

interface PullsListFilesParams {
  readonly owner: string;
  readonly page?: number;
  readonly perPage?: number;
  readonly pullNumber: number;
  readonly repo: string;
}

type PullsListFilesResponse = GitFileInfo[];

export type {
  CommitsGetCommitParams,
  CommitsGetCommitResponse,
  CommitsListFilesParams,
  CommitsListFilesResponse,
  GitFileInfo,
  GitHubClient,
  PullsListFilesParams,
  PullsListFilesResponse,
};
