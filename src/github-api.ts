import * as github from "@actions/github";


export const PR_NOT_FOUND: number = -1;


export async function getChangedFiles(
  client: github.GitHub,
  prNumber: number
): Promise<any[]> {
  const listFilesResponse = await client.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber
  });

  return listFilesResponse.data;
}

export function getPrNumber(): number {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return PR_NOT_FOUND;
  }

  return pullRequest.number;
}
