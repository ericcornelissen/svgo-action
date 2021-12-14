import type {
  CommitsGetCommitParams,
  CommitsGetCommitResponse,
  CommitsListFilesParams,
  CommitsListFilesResponse,
  error,
  GitFileInfo,
  GitHubClient,
  Octokit,
  PullsListFilesParams,
  PullsListFilesResponse,
} from "./types";

import errors from "../errors";

class Client implements GitHubClient {
  private readonly octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  public get commits(): CommitsClient {
    return new CommitsClient(this.octokit);
  }

  public get pulls(): PullsClient {
    return new PullsClient(this.octokit);
  }
}

class CommitsClient {
  private readonly octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  private async getCommit(
    params: CommitsGetCommitParams,
  ): Promise<[CommitsGetCommitResponse, error]> {
    let result: CommitsGetCommitResponse = { } as CommitsGetCommitResponse;
    let err: error = null;

    try {
      const response = await this.octokit.rest.repos.getCommit({
        owner: params.owner,
        repo: params.repo,
        ref: params.ref,
      });

      result = response.data as CommitsGetCommitResponse;
    } catch (thrownError) {
      err = errors.New(`could not get commit '${params.ref}' (${thrownError})`);
    }

    return [result, err];
  }

  public async listFiles(
    params: CommitsListFilesParams,
  ): Promise<[CommitsListFilesResponse, error]> {
    let result: GitFileInfo[] = [];

    const [commit, err] = await this.getCommit(params);
    if (err === null) {
      result = commit.files;
    }

    return [result, err];
  }
}

class PullsClient {
  private readonly octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  public async listFiles(
    params: PullsListFilesParams,
  ): Promise<[PullsListFilesResponse, error]> {
    let result: PullsListFilesResponse = [];
    let err: error = null;

    try {
      const response = await this.octokit.rest.pulls.listFiles({
        owner: params.owner,
        repo: params.repo,
        pull_number: params.pullNumber,
        per_page: params.perPage,
        page: params.page,
      });
      result = response.data;
    } catch(thrownError) {
      err = errors.New(`could not list Pull Request files (${thrownError})`);
    }

    return [result, err];
  }
}

export default Client;
