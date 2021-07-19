import type { error } from "../types";

interface GitHubClient {
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
  };
}

export type {
  GitHubClient,
  Octokit,
  PullsListFilesParams,
  PullsListFilesResponse,
};
