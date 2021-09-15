import type { SupportedSvgoVersions } from "../svgo";

interface Config {
  readonly ignoreGlobs: InputValue<string[]>;
  readonly isDryRun: InputValue<boolean>;
  readonly svgoConfigPath: InputValue<string>;
  readonly svgoVersion: InputValue<SupportedSvgoVersions>;
}

interface InputValue<T> {
  readonly provided: boolean;
  readonly value: T;
}

export type {
  Config,
  InputValue,
};
