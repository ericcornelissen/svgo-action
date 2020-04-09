import * as core from "@actions/core";


const INPUT_NAME_COMMENTS = "comments";
const INPUT_NAME_CONFIG_PATH = "configuration-path";
const INPUT_NAME_CONVENTIONAL_COMMITS = "conventional-commits";
const INPUT_NAME_DRY_RUN = "dry-run";
const INPUT_NAME_REPO_TOKEN = "repo-token";
const INPUT_NAME_SVGO_OPTIONS = "svgo-options";

const NOT_REQUIRED = { required: false };
const REQUIRED = { required: true };

const BOOLEAN = "boolean";
const FALSE = "false";
const TRUE = "true";

const CONVENTIONAL_COMMIT_TITLE = "chore: optimize {{optimizedCount}} SVG(s)";
const DEFAULT_COMMIT_DESCRIPTION = "Optimized SVG(s):\n{{filesList}}";
const DEFAULT_COMMIT_TITLE = "Optimize {{optimizedCount}} SVG(s) with SVGO";


export type RawActionConfig = {
  readonly comments?: boolean;
  readonly commit?: {
    readonly conventional?: boolean;
    readonly title?: string;
    readonly description?: string;
  };
  readonly "dry-run"?: boolean;
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
  public readonly enableComments: boolean;
  public readonly ignoredGlob: string;
  public readonly isDryRun: boolean;
  public readonly svgoOptionsPath: string;

  constructor(config: RawActionConfig = { }) {
    this.commitDescription = ActionConfig.getCommitDescription(config);
    this.commitTitle = ActionConfig.getCommitTitle(config);
    this.enableComments = ActionConfig.getCommentsValue(config);
    this.ignoredGlob = "";
    this.isDryRun = ActionConfig.getDryRunValue(config);
    this.svgoOptionsPath = ActionConfig.getSvgoOptionsPath(config);
  }

  private static getCommentsValue(config: RawActionConfig): boolean {
    return this.normalizeBoolOption(config.comments, INPUT_NAME_COMMENTS, true);
  }

  private static getCommitDescription(config: RawActionConfig): string {
    return (config.commit?.description !== undefined) ?
      config.commit.description : DEFAULT_COMMIT_DESCRIPTION;
  }

  private static getCommitTitle(config: RawActionConfig): string {
    const useConventionalCommit = this.normalizeBoolOption(
      config.commit?.conventional,
      INPUT_NAME_CONVENTIONAL_COMMITS,
      true,
    );

    if (useConventionalCommit) {
      return CONVENTIONAL_COMMIT_TITLE;
    } else {
      return config.commit?.title || DEFAULT_COMMIT_TITLE;
    }
  }

  private static getSvgoOptionsPath(config: RawActionConfig): string {
    return config["svgo-options"] || core.getInput(INPUT_NAME_SVGO_OPTIONS, NOT_REQUIRED);
  }

  private static getDryRunValue(config: RawActionConfig): boolean {
    return this.normalizeBoolOption(config["dry-run"], INPUT_NAME_DRY_RUN, true);
  }

  private static normalizeBoolOption(
    configValue: boolean | undefined,
    inputName: string,
    assumptionValue: boolean,
  ): boolean {
    const value = (configValue !== undefined) ? configValue : core.getInput(inputName, NOT_REQUIRED);
    if (typeof value === BOOLEAN) {
      return value as boolean;
    } else if (value === FALSE) {
      return false;
    } else if (value === TRUE) {
      return true;
    } else {
      core.info(`Unknown ${inputName} value '${value}', assuming ${assumptionValue}`);
      return assumptionValue;
    }
  }

}
