import * as github from "@actions/github";


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
