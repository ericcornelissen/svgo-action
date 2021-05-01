import type { Inputs } from "./types";

import {
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_SVGO_OPTIONS,
  INPUT_NAME_SVGO_VERSION,
  INPUT_NOT_REQUIRED,
} from "./constants";

const FALSE = "false";
const STRING = "string";
const TRUE = "true";

const DEFAULT_SVGO_VERSION = 2;

export class ActionConfig {
  public readonly ignoreGlob: string;
  public readonly isDryRun: boolean;
  public readonly svgoOptionsPath: string;
  public readonly svgoVersion: 1 | 2;

  constructor(inputs: Inputs) {
    this.ignoreGlob = ActionConfig.getIgnoreGlob(inputs);
    this.isDryRun = ActionConfig.getDryRunValue(inputs);
    this.svgoOptionsPath = ActionConfig.getSvgoOptionsPath(inputs);
    this.svgoVersion = ActionConfig.getSvgoVersion(inputs);
  }

  private static getDryRunValue(
    inputs: Inputs,
  ): boolean {
    return this.normalizeBoolOption(
      inputs,
      INPUT_NAME_DRY_RUN,
      true,
    );
  }

  private static getIgnoreGlob(
    inputs: Inputs,
  ): string {
    return inputs.getInput(INPUT_NAME_IGNORE, INPUT_NOT_REQUIRED);
  }

  private static getSvgoOptionsPath(
    inputs: Inputs,
  ): string {
    return inputs.getInput(INPUT_NAME_SVGO_OPTIONS, INPUT_NOT_REQUIRED);
  }

  private static getSvgoVersion(
    inputs: Inputs,
  ): 1 | 2 {
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
    inputs: Inputs,
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
    inputs: Inputs,
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
