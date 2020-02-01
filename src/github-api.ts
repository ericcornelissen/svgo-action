import * as github from "@actions/github";


export interface FileInfo {
  readonly path: string,
  readonly status: string,
};


export async function getPullRequestFiles(
  client: github.GitHub,
  prNumber: number
): Promise<FileInfo[]> {
  const prFilesDetails = await client.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber,
  });

  return prFilesDetails.data.map(details => ({
    path: details.filename,
    status: details.status,
  }));
}
