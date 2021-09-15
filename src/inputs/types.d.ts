import type { SupportedSvgoVersions } from "../svgo";

interface Config {
  readonly ignoreGlobs: string[];
  readonly isDryRun: boolean;
  readonly svgoConfigPath: string;
  readonly svgoVersion: SupportedSvgoVersions;
}

interface InputValue<T> {
  readonly provided: boolean;
  readonly value: T;
}

export type {
  Config,
  InputValue,
};
