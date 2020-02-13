import * as github from "@actions/github";


function getHead(): string {
  return github.context.payload.pull_request?.head.ref;
}


export const PR_NOT_FOUND = -1;


export interface FileInfo {
  readonly path: string;
  readonly status: string;
}

export interface FileData {
  readonly path: string;
  readonly content: string;
  readonly encoding: string;
}


export async function commit(
  client: github.GitHub,
  path: string,
  data: string,
  encoding: string,
  commitMessage: string
): Promise<void> {
  const MODE = "100644";
  const TYPE = "blob";

  const { data: blobData } = await client.git.createBlob({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    content: data,
    encoding: encoding,
  });

  const { data: treeData } = await client.git.createTree({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    tree: [
      {
        path: path,
        mode: MODE,
        type: TYPE,
        sha: blobData.sha,
      },
    ],
  });

  const { data: commitData } = await client.git.createCommit({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    message: commitMessage,
    tree: treeData.sha,
    parents: [github.context.sha],
  });

  const head = getHead();
  console.log(head);
  await client.git.updateRef({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    ref: `heads/${head}`,
    sha: commitData.sha,
  });
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

export async function getPrFiles(
  client: github.GitHub,
  prNumber: number
): Promise<FileInfo[]> {
  const prFilesDetails = await client.pulls.listFiles({
    owner: github.context.repo.owner,
    repo: github.context.repo.repo,
    pull_number: prNumber, /* eslint-disable-line @typescript-eslint/camelcase */
  });

  return prFilesDetails.data.map(details => ({
    path: details.filename,
    status: details.status,
  }));
}

export function getPrNumber(): number {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return PR_NOT_FOUND;
  }

  return pullRequest.number;
}
