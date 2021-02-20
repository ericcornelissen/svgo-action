import {
  CONVENTIONAL_COMMIT_TITLE,
  DEFAULT_COMMIT_BODY,
  DEFAULT_COMMIT_TITLE,
  DEFAULT_COMMENT,
  INPUT_NAME_BRANCH,
  INPUT_NAME_COMMENT,
  INPUT_NAME_CONVENTIONAL_COMMITS,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_SVGO_VERSION,
  INPUT_NAME_SVGO_OPTIONS,
} from "./constants";
import { Inputs, RawActionConfig } from "./types";


const NOT_REQUIRED = { required: false };

const BOOLEAN = "boolean";
const FALSE = "false";
const STRING = "string";
const TRUE = "true";

const DEFAULT_SVGO_VERSION = 1;


export class ActionConfig {

  public readonly branch: string | null;
  public readonly comment: string;
  public readonly commitBody: string;
  public readonly commitTitle: string;
  public readonly enableComments: boolean;
  public readonly ignoreGlob: string;
  public readonly isDryRun: boolean;
  public readonly svgoVersion: 1 | 2;
  public readonly svgoOptionsPath: string;

  constructor(inputs: Inputs, config: RawActionConfig = { }) {
    this.isDryRun = ActionConfig.getDryRunValue(inputs, config);

    this.branch = ActionConfig.getBranch(inputs, config);
    this.comment = ActionConfig.getCommentValue(inputs, config);
    this.commitBody = ActionConfig.getCommitBody(config);
    this.commitTitle = ActionConfig.getCommitTitle(inputs, config);
    this.enableComments = ActionConfig.getEnableComments(
      inputs,
      config,
      this.isDryRun,
    );
    this.ignoreGlob = ActionConfig.getIgnoreGlob(inputs, config);
    this.svgoVersion = ActionConfig.getSvgoVersion(inputs, config);
    this.svgoOptionsPath = ActionConfig.getSvgoOptionsPath(inputs, config);
  }

  private static getBranch(
    inputs: Inputs,
    config: RawActionConfig,
  ): string | null {
    const value = (config.branch !== undefined) ?
      config.branch : inputs.getInput(INPUT_NAME_BRANCH, NOT_REQUIRED);

    return value || null;
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
    return (config.commit?.body !== undefined) ?
      config.commit.body : DEFAULT_COMMIT_BODY;
  }

  private static getCommitTitle(
    inputs: Inputs,
    config: RawActionConfig,
  ): string {
    const useConventionalCommit = this.normalizeBoolOption(
      inputs,
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

  private static getIgnoreGlob(
    inputs: Inputs,
    config: RawActionConfig,
  ): string {
    return (config.ignore !== undefined) ?
      config.ignore : inputs.getInput(INPUT_NAME_IGNORE, NOT_REQUIRED);
  }

  private static getSvgoVersion(
    inputs: Inputs,
    config: RawActionConfig,
  ): 1 | 2 {
    let configVersion = config["svgo-version"];
    if (configVersion !== undefined) {
      if (typeof configVersion === "string") {
        configVersion = parseInt(configVersion, 10);
      }
      if (configVersion === 1 || configVersion === 2) {
        return configVersion;
      }
    } else {
      const rawInputVersion = inputs.getInput(
        INPUT_NAME_SVGO_VERSION,
        NOT_REQUIRED,
      );
      const inputVersion = parseInt(rawInputVersion, 10);
      if (inputVersion !== undefined) {
        if (inputVersion === 1 || inputVersion === 2) {
          return inputVersion;
        }
      }
    }

    return DEFAULT_SVGO_VERSION;
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
