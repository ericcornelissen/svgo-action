import type { AllowedSvgoVersions } from "./svgo";
import type { Inputter } from "./types";

const FALSE = "false";
const STRING = "string";
const TRUE = "true";

const INPUT_NOT_REQUIRED = { required: false };

const DEFAULT_SVGO_VERSION: AllowedSvgoVersions = 2;

const INPUT_NAME_DRY_RUN = "dry-run";
const INPUT_NAME_IGNORE = "ignore";
const INPUT_NAME_SVGO_OPTIONS = "svgo-options";
const INPUT_NAME_SVGO_VERSION = "svgo-version";

export class ActionConfig {
  public readonly ignoreGlob: string;
  public readonly isDryRun: boolean;
  public readonly svgoOptionsPath: string;
  public readonly svgoVersion: AllowedSvgoVersions;

  constructor(inputs: Inputter) {
    this.ignoreGlob = ActionConfig.getIgnoreGlob(inputs);
    this.isDryRun = ActionConfig.getDryRunValue(inputs);
    this.svgoOptionsPath = ActionConfig.getSvgoOptionsPath(inputs);
    this.svgoVersion = ActionConfig.getSvgoVersion(inputs);
  }

  private static getDryRunValue(
    inputs: Inputter,
  ): boolean {
    return this.normalizeBoolOption(
      inputs,
      INPUT_NAME_DRY_RUN,
      true,
    );
  }

  private static getIgnoreGlob(
    inputs: Inputter,
  ): string {
    return inputs.getInput(INPUT_NAME_IGNORE, INPUT_NOT_REQUIRED);
  }

  private static getSvgoOptionsPath(
    inputs: Inputter,
  ): string {
    return inputs.getInput(INPUT_NAME_SVGO_OPTIONS, INPUT_NOT_REQUIRED);
  }

  private static getSvgoVersion(
    inputs: Inputter,
  ): AllowedSvgoVersions {
    const version = ActionConfig.normalizeIntegerOption(
      inputs,
      INPUT_NAME_SVGO_VERSION,
      DEFAULT_SVGO_VERSION,
    );

    if (version === 1 || version === 2) {
      return version;
    }

    return DEFAULT_SVGO_VERSION;
  }

  private static normalizeBoolOption(
    inputs: Inputter,
    inputName: string,
    defaultValue: boolean,
  ): boolean {
    const value = inputs.getInput(inputName, INPUT_NOT_REQUIRED);
    if (value === FALSE) {
      return false;
    } else if (value === TRUE) {
      return true;
    } else {
      return defaultValue;
    }
  }

  private static normalizeIntegerOption(
    inputs: Inputter,
    inputName: string,
    defaultValue: number,
  ): number {
    const value = inputs.getInput(inputName, INPUT_NOT_REQUIRED);
    if (typeof value === STRING) {
      return parseInt(value as string, 10);
    } else {
      return defaultValue;
    }
  }
}
