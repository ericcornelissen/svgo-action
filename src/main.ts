import * as core from "@actions/core";
import * as github from "@actions/github";


const NOT_FOUND: number = -1;


async function main(): Promise<void> {
  try {
    const token = core.getInput("repo-token", { required: true });
    const configPath = core.getInput("configuration-path", { required: true });

    const prNumber: number = getPrNumber();
    if (prNumber === NOT_FOUND) {
      console.info("Could not get Pull Request number from context, exiting");
      return;
    }

    const client: github.GitHub = new github.GitHub(token);

    core.debug(`fetching changed files for pull request #${prNumber}`);
    const changedFiles: any[] = await getChangedFiles(client, prNumber);
    console.log("[info]", changedFiles)
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);
  }
}

function getPrNumber(): number {
  const pullRequest = github.context.payload.pull_request;
  if (!pullRequest) {
    return NOT_FOUND;
  }

  return pullRequest.number;
}

async function getChangedFiles(
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

main();
