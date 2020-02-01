import * as github from "@actions/github";


export const PR_NOT_FOUND: number = -1;


export interface FileInfo {
  readonly path: string,
  readonly status: string,
};

export interface FileData {
  readonly path: string,
  readonly content: string,
  readonly encoding: string,
}


export async function getPrFiles(
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

export async function getPrFile(
  client: github.GitHub,
  path: string
): Promise<FileData> {
  const fileContents = await client.repos.getContents({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    path: path,
    ref: github.context.sha,
  });

  const fileDetails = fileContents.data[0] || fileContents.data;
  return {
    path: fileDetails.path,
    content: fileDetails.content,
    encoding: fileDetails.encoding,
  };
}

export function getPrNumber(): number {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return PR_NOT_FOUND;
  }

  return pullRequest.number;
}
