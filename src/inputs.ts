import * as core from "@actions/core";


const INPUT_NAME_CONFIG_PATH = "configuration-path";
const INPUT_NAME_DRY_RUN = "dry-run";
const INPUT_NAME_REPO_TOKEN = "repo-token";

const FALSE = "false";
const TRUE = "true";


export function getConfigurationPath(): string {
  return core.getInput(INPUT_NAME_CONFIG_PATH, { required: true });
}

export function getDryRun(): boolean {
  const value = core.getInput(INPUT_NAME_DRY_RUN, { required: false });
  if (value === FALSE) {
    return false;
  } else if (value === TRUE) {
    return true;
  } else {
    core.info(`Unknown dry-run value '${value}', assuming ${TRUE}`);
    return true;
  }
}

export function getRepoToken(): string {
  return core.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
}
