import {
  CONVENTIONAL_COMMIT_TITLE,
  DEFAULT_COMMIT_BODY,
  DEFAULT_COMMIT_TITLE,
  DEFAULT_COMMENT,
  INPUT_NAME_COMMENT,
  INPUT_NAME_COMMIT,
  INPUT_NAME_CONVENTIONAL_COMMITS,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_SVGO_OPTIONS,
} from "./constants";
import { Inputs, RawActionConfig } from "./types";


const NOT_REQUIRED = { required: false };

const BOOLEAN = "boolean";
const FALSE = "false";
const STRING = "string";
const TRUE = "true";


export class ActionConfig {

  public readonly comment: string;
  public readonly commit: boolean;
  public readonly commitBody: string;
  public readonly commitTitle: string;
  public readonly enableComments: boolean;
  public readonly ignoreGlob: string;
  public readonly isDryRun: boolean;
  public readonly svgoOptionsPath: string;

  constructor(inputs: Inputs, config: RawActionConfig = { }) {
    const isDryRun = ActionConfig.getDryRunValue(inputs, config);
    this.isDryRun = isDryRun;

    this.comment = ActionConfig.getCommentValue(inputs, config);
    this.commit = ActionConfig.getEnableCommits(inputs, config, isDryRun);
    this.commitBody = ActionConfig.getCommitBody(config);
    this.commitTitle = ActionConfig.getCommitTitle(inputs, config);
    this.enableComments = ActionConfig.getEnableComments(
      inputs,
      config,
      isDryRun,
    );
    this.ignoreGlob = ActionConfig.getIgnoreGlob(inputs, config);
    this.svgoOptionsPath = ActionConfig.getSvgoOptionsPath(inputs, config);
  }

  private static getCommentValue(
    inputs: Inputs,
    config: RawActionConfig,
  ): string {
    const value = (config.comment !== undefined) ?
      config.comment : inputs.getInput(INPUT_NAME_COMMENT, NOT_REQUIRED);

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
    if (typeof config.commit === "boolean") {
      return DEFAULT_COMMIT_BODY;
    }

    return (config.commit?.body !== undefined) ?
      config.commit.body : DEFAULT_COMMIT_BODY;
  }

  private static getCommitTitle(
    inputs: Inputs,
    config: RawActionConfig,
  ): string {
    let conventional: boolean | undefined;
    if (typeof config.commit !== "boolean") {
      conventional = config.commit?.conventional;
    }

    const useConventionalCommit = this.normalizeBoolOption(
      inputs,
      conventional,
      INPUT_NAME_CONVENTIONAL_COMMITS,
      true,
    );

    if (useConventionalCommit) {
      return CONVENTIONAL_COMMIT_TITLE;
    } else if (typeof config.commit === "boolean") {
      return DEFAULT_COMMIT_TITLE;
    } else {
      return config.commit?.title || DEFAULT_COMMIT_TITLE;
    }
  }

  private static getDryRunValue(
    inputs: Inputs,
    config: RawActionConfig,
  ): boolean {
    return this.normalizeBoolOption(
      inputs,
      config["dry-run"],
      INPUT_NAME_DRY_RUN,
      true,
    );
  }

  private static getEnableComments(
    inputs: Inputs,
    config: RawActionConfig,
    dryRun: boolean,
  ): boolean {
    return this.normalizeBoolOption(
      inputs,
      config.comment as boolean,
      INPUT_NAME_COMMENT,
      true,
    ) && !dryRun;
  }

  private static getEnableCommits(
    inputs: Inputs,
    config: RawActionConfig,
    dryRun: boolean,
  ): boolean {
    let configValue: boolean | undefined;
    if (typeof config.commit === "boolean") {
      configValue = config.commit as boolean;
    } else if (config.commit !== undefined) {
      configValue = true;
    }

    return this.normalizeBoolOption(
      inputs,
      configValue,
      INPUT_NAME_COMMIT,
      true,
    ) && !dryRun;
  }

  private static getIgnoreGlob(
    inputs: Inputs,
    config: RawActionConfig,
  ): string {
    return (config.ignore !== undefined) ?
      config.ignore : inputs.getInput(INPUT_NAME_IGNORE, NOT_REQUIRED);
  }

  private static getSvgoOptionsPath(
    inputs: Inputs,
    config: RawActionConfig,
  ): string {
    return config["svgo-options"] || inputs.getInput(
      INPUT_NAME_SVGO_OPTIONS,
      NOT_REQUIRED,
    );
  }

  private static normalizeBoolOption(
    inputs: Inputs,
    configValue: boolean | undefined,
    inputName: string,
    defaultValue: boolean,
  ): boolean {
    const value = (configValue !== undefined) ?
      configValue : inputs.getInput(inputName, NOT_REQUIRED);

    if (typeof value === BOOLEAN) {
      return value as boolean;
    } else if (value === FALSE) {
      return false;
    } else if (value === TRUE) {
      return true;
    } else {
      return defaultValue;
    }
  }

}
