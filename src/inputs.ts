import * as core from "@actions/core";


const INPUT_NAME_CONFIG_PATH = "configuration-path";
const INPUT_NAME_DRY_RUN = "dry-run";
const INPUT_NAME_REPO_TOKEN = "repo-token";
const INPUT_NAME_SVGO_OPTIONS = "svgo-options";

const NOT_REQUIRED = { required: false };
const REQUIRED = { required: true };

const DEFAULT_COMMIT_DESCRIPTION = "Optimized SVGs:\n{{fileList}}";
const DEFAULT_COMMIT_TITLE = "Optimize {{optimizedCount}} SVG(s) with SVGO";


export type RawActionConfig = {
  readonly commit?: {
    readonly title?: string;
    readonly description?: string;
  };
  readonly "dry-run"?: boolean | string;
  readonly "svgo-options"?: string;
}


export function getConfigFilePath(): string {
  return core.getInput(INPUT_NAME_CONFIG_PATH, NOT_REQUIRED);
}

export function getRepoToken(): string {
  return core.getInput(INPUT_NAME_REPO_TOKEN, REQUIRED);
}

export class ActionConfig {

  public readonly commitDescription: string;
  public readonly commitTitle: string;
  public readonly isDryRun: boolean;
  public readonly svgoOptionsPath: string;

  constructor(config: RawActionConfig = { }) {
    this.commitDescription = ActionConfig.getCommitDescription(config);
    this.commitTitle = ActionConfig.getCommitTitle(config);
    this.isDryRun = ActionConfig.getDryRunValue(config);
    this.svgoOptionsPath = ActionConfig.getSvgoOptionsPath(config);
  }

  private static getCommitDescription(config: RawActionConfig): string {
    return config.commit?.description || DEFAULT_COMMIT_DESCRIPTION;
  }

  private static getCommitTitle(config: RawActionConfig): string {
    return config.commit?.title || DEFAULT_COMMIT_TITLE;
  }

  private static getSvgoOptionsPath(config: RawActionConfig): string {
    return config["svgo-options"] || core.getInput(INPUT_NAME_SVGO_OPTIONS, NOT_REQUIRED);
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
