import type { Inputs, RawActionConfig } from "./types";

import {
  DEFAULT_COMMENT,
  INPUT_NAME_COMMENT,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_SVGO_OPTIONS,
  INPUT_NAME_SVGO_VERSION,
  INPUT_NOT_REQUIRED,
} from "./constants";

const BOOLEAN = "boolean";
const FALSE = "false";
const NUMBER = "number";
const STRING = "string";
const TRUE = "true";

const DEFAULT_SVGO_VERSION = 2;

export class ActionConfig {
  public readonly comment: string;
  public readonly enableComments: boolean;
  public readonly ignoreGlob: string;
  public readonly isDryRun: boolean;
  public readonly svgoOptionsPath: string;
  public readonly svgoVersion: 1 | 2;

  constructor(inputs: Inputs, config: RawActionConfig = { }) {
    this.isDryRun = ActionConfig.getDryRunValue(inputs, config);

    this.comment = ActionConfig.getCommentValue(inputs, config);
    this.enableComments = ActionConfig.getEnableComments(
      inputs,
      config,
      this.isDryRun,
    );
    this.ignoreGlob = ActionConfig.getIgnoreGlob(inputs, config);
    this.svgoOptionsPath = ActionConfig.getSvgoOptionsPath(inputs, config);
    this.svgoVersion = ActionConfig.getSvgoVersion(inputs, config);
  }

  private static getCommentValue(
    inputs: Inputs,
    config: RawActionConfig,
  ): string {
    const value = (config.comment !== undefined) ?
      config.comment : inputs.getInput(INPUT_NAME_COMMENT, INPUT_NOT_REQUIRED);

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
      config.ignore : inputs.getInput(INPUT_NAME_IGNORE, INPUT_NOT_REQUIRED);
  }

  private static getSvgoOptionsPath(
    inputs: Inputs,
    config: RawActionConfig,
  ): string {
    return config["svgo-options"] || inputs.getInput(
      INPUT_NAME_SVGO_OPTIONS,
      INPUT_NOT_REQUIRED,
    );
  }

  private static getSvgoVersion(
    inputs: Inputs,
    config: RawActionConfig,
  ): 1 | 2 {
    const version = ActionConfig.normalizeIntegerOption(
      inputs,
      config["svgo-version"],
      INPUT_NAME_SVGO_VERSION,
      DEFAULT_SVGO_VERSION,
    );

    if (version === 1 || version === 2) {
      return version;
    }

    return DEFAULT_SVGO_VERSION;
  }

  private static normalizeBoolOption(
    inputs: Inputs,
    configValue: boolean | undefined,
    inputName: string,
    defaultValue: boolean,
  ): boolean {
    const value = (configValue !== undefined) ?
      configValue : inputs.getInput(inputName, INPUT_NOT_REQUIRED);

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

  private static normalizeIntegerOption(
    inputs: Inputs,
    configValue: number | undefined,
    inputName: string,
    defaultValue: number,
  ): number {
    const value = (configValue !== undefined) ?
      configValue : inputs.getInput(inputName, INPUT_NOT_REQUIRED);

    if (typeof value === NUMBER) {
      return value as number;
    } else if (typeof value === STRING) {
      return parseInt(value as string, 10);
    } else {
      return defaultValue;
    }
  }
}
