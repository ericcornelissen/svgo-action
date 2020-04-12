import * as core from "@actions/core";


const INPUT_NAME_COMMENT = "comment";
const INPUT_NAME_CONFIG_PATH = "configuration-path";
const INPUT_NAME_CONVENTIONAL_COMMITS = "conventional-commits";
const INPUT_NAME_DRY_RUN = "dry-run";
const INPUT_NAME_IGNORE = "ignore";
const INPUT_NAME_REPO_TOKEN = "repo-token";
const INPUT_NAME_SVGO_OPTIONS = "svgo-options";

const NOT_REQUIRED = { required: false };
const REQUIRED = { required: true };

const BOOLEAN = "boolean";
const FALSE = "false";
const STRING = "string";
const TRUE = "true";

const CONVENTIONAL_COMMIT_TITLE = "chore: optimize {{optimizedCount}} SVG(s)";
const DEFAULT_COMMIT_BODY = "Optimized SVG(s):\n{{filesList}}";
const DEFAULT_COMMIT_TITLE = "Optimize {{optimizedCount}} SVG(s) with SVGO";
const DEFAULT_COMMENT = "SVG(s) automatically optimized using [SVGO](https://github.com/svg/svgo) :sparkles:\n\n{{filesTable}}";


export type RawActionConfig = {
  readonly comment?: boolean | string;
  readonly commit?: {
    readonly conventional?: boolean;
    readonly title?: string;
    readonly body?: string;
  };
  readonly "dry-run"?: boolean;
  readonly ignore?: string;
  readonly "svgo-options"?: string;
}


export function getConfigFilePath(): string {
  return core.getInput(INPUT_NAME_CONFIG_PATH, NOT_REQUIRED);
}

export function getRepoToken(): string {
  return core.getInput(INPUT_NAME_REPO_TOKEN, REQUIRED);
}

export class ActionConfig {

  public readonly comment: string;
  public readonly commitBody: string;
  public readonly commitTitle: string;
  public readonly enableComments: boolean;
  public readonly ignoreGlob: string;
  public readonly isDryRun: boolean;
  public readonly svgoOptionsPath: string;

  constructor(config: RawActionConfig = { }) {
    this.comment = ActionConfig.getCommentValue(config);
    this.commitBody = ActionConfig.getCommitBody(config);
    this.commitTitle = ActionConfig.getCommitTitle(config);
    this.enableComments = ActionConfig.getEnableCommentsValue(config);
    this.ignoreGlob = ActionConfig.getIgnoreGlob(config);
    this.isDryRun = ActionConfig.getDryRunValue(config);
    this.svgoOptionsPath = ActionConfig.getSvgoOptionsPath(config);
  }

  private static getCommentValue(config: RawActionConfig): string {
    const value = (config.comment !== undefined) ?
      config.comment : core.getInput(INPUT_NAME_COMMENT, NOT_REQUIRED);
    if (typeof value === STRING && value !== TRUE) {
      // If the value is (the string) `"false"` comments will be disabled, so it
      // does not matter that the comment template is `"false"`. If the value is
      // (the string) `"true"`, we interpret it as (the boolean) `true`, so the
      // default template should be used.
      return value as string;
    } else {
      return DEFAULT_COMMENT;
    }
  }

  private static getCommitBody(config: RawActionConfig): string {
    return (config.commit?.body !== undefined) ?
      config.commit.body : DEFAULT_COMMIT_BODY;
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

  private static getEnableCommentsValue(config: RawActionConfig): boolean {
    return this.normalizeBoolOption(config.comment as boolean, INPUT_NAME_COMMENT, true);
  }

  private static getIgnoreGlob(config: RawActionConfig): string {
    return (config.ignore !== undefined) ?
      config.ignore : core.getInput(INPUT_NAME_IGNORE, NOT_REQUIRED);
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
