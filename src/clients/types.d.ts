import type { error } from "../types";

interface CommitsGetCommitParams {
  readonly owner: string;
  readonly repo: string;
  readonly ref: string;
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
  }
  readonly pulls: {
    listFiles(
      params: PullsListFilesParams,
    ): Promise<[PullsListFilesResponse, error]>
  }
}

interface PullsListFilesParams {
  readonly owner: string;
  readonly repo: string;
  readonly pullNumber: number;
  readonly perPage?: number;
  readonly page?: number;
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
