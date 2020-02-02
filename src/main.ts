import * as core from "@actions/core";
import * as github from "@actions/github";

import { PR_NOT_FOUND, getChangedFiles, getPrNumber } from './github-api'


export default async function main(): Promise<boolean> {
  try {
    const token = core.getInput("repo-token", { required: true });
    const configPath = core.getInput("configuration-path", { required: true });

    const prNumber: number = getPrNumber();
    if (prNumber === PR_NOT_FOUND) {
      core.error("Could not get Pull Request number from context, exiting");
      return false;
    }

    const client: github.GitHub = new github.GitHub(token);

    core.debug(`fetching changed files for pull request #${prNumber}`);
    const changedFiles: any[] = await getChangedFiles(client, prNumber);
    console.log("[info]", changedFiles)

    return true;
  } catch (error) {
    core.error(error);
    core.setFailed(error.message);

    return false;
  }
}


main();
