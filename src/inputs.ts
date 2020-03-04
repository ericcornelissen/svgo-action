import * as core from "@actions/core";


const INPUT_NAME_CONFIG_PATH = "configuration-path";
const INPUT_NAME_DRY_RUN = "dry-run";
const INPUT_NAME_REPO_TOKEN = "repo-token";
const INPUT_NAME_SVGO_OPTIONS = "svgo-options";

const REQUIRED = { required: true };
const NOT_REQUIRED = { required: false };


export type RawActionConfig = {
  readonly "dry-run"?: boolean;
  readonly "svgo-options"?: string;
}


export class ActionConfig {

  public readonly isDryRun: boolean;
  public readonly svgoOptionsPath: string;

  constructor(config: RawActionConfig = { }) {
    this.isDryRun = ActionConfig.getDryRunValue(config);
    this.svgoOptionsPath = ActionConfig.getSvgoOptionsPath(config);
  }

  private static getSvgoOptionsPath(config: RawActionConfig): string {
    return config["svgo-options"]
      || core.getInput(INPUT_NAME_SVGO_OPTIONS, NOT_REQUIRED);
  }

  private static getDryRunValue(config: RawActionConfig): boolean {
    const BOOLEAN = "boolean", FALSE = "false", TRUE = "true";

    const value = (config["dry-run"] !== undefined)
      ? config["dry-run"] : core.getInput(INPUT_NAME_DRY_RUN, NOT_REQUIRED);

    if (typeof value === BOOLEAN) {
      return value as boolean;
    } else if (value === FALSE) {
      return false;
    } else if (value === TRUE) {
      return true;
    } else {
      core.info(`Unknown dry-run value '${value}', assuming ${TRUE}`);
      return true;
    }
  }

}

export function getConfigFilePath(): string {
  return core.getInput(INPUT_NAME_CONFIG_PATH, NOT_REQUIRED);
}

export function getRepoToken(): string {
  return core.getInput(INPUT_NAME_REPO_TOKEN, REQUIRED);
}
