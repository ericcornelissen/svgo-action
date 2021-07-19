import type { error } from "../types";
import type {
  GitHubClient,
  PullsListFilesParams,
  PullsListFilesResponse,
  Octokit,
} from "./types";

import errors from "../errors";

class PullsClient {
  private readonly octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  public async listFiles(
    params: PullsListFilesParams,
  ): Promise<[PullsListFilesResponse, error]> {
    let result;
    let err: error = null;

    try {
      result = await this.octokit.rest.pulls.listFiles({
        owner: params.owner,
        repo: params.repo,
        pull_number: params.pullNumber,
        per_page: params.perPage,
        page: params.page,
      });
    } catch(thrownError) {
      err = errors.New(`could not list Pull Request files (${thrownError})`);
    }

    return [result, err];
  }
}

class Client implements GitHubClient {
  private readonly octokit: Octokit;

  constructor(octokit: Octokit) {
    this.octokit = octokit;
  }

  public get pulls(): PullsClient {
    return new PullsClient(this.octokit);
  }
}

export default Client;
