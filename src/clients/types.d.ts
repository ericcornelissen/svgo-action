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

interface PullsListFilesResponse {
  data: {
    readonly filename: string;
    readonly status: string;
  }[];
}

interface Octokit {
  readonly rest: {
    readonly pulls: {
      listFiles(params: {
        owner: string;
        repo: string;
        pull_number: number;
        per_page?: number;
        page?: number;
      }): Promise<{
        data: { filename: string; status: string; }[]
      }>;
    };
    readonly repos: {
      getCommit(params: {
        owner: string;
        repo: string;
        ref: string;
      }): Promise<{
        data: {
          files: { filename: string; status: string; }[];
        }
      }>;
    };
  };
}

export type {
  CommitsGetCommitParams,
  CommitsGetCommitResponse,
  CommitsListFilesParams,
  CommitsListFilesResponse,
  GitFileInfo,
  GitHubClient,
  Octokit,
  PullsListFilesParams,
  PullsListFilesResponse,
};
