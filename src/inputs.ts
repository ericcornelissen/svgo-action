import * as core from "@actions/core";


const INPUT_NAME_CONFIG_PATH = "configuration-path";
const INPUT_NAME_DRY_RUN = "dry-run";
const INPUT_NAME_REPO_TOKEN = "repo-token";

const FALSE = "false";
const TRUE = "true";


export type ConfigObject = {
  readonly "dry-run"?: string;
}


export class ActionConfig {

  private readonly config: ConfigObject;

  constructor(config?: ConfigObject) {
    this.config = config || { };
  }

  public isDryRun(): boolean {
    const value: string = this.config["dry-run"]
      || core.getInput(INPUT_NAME_DRY_RUN, { required: false });

    if (value === FALSE) {
      return false;
    } else if (value === TRUE) {
      return true;
    } else {
      core.info(`Unknown dry-run value '${value}', assuming ${TRUE}`);
      return true;
    }
  }

}

export function getConfigurationPath(): string {
  return core.getInput(INPUT_NAME_CONFIG_PATH, { required: true });
}

export function getRepoToken(): string {
  return core.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
}
