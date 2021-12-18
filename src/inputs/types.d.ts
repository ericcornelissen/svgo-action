import type { SupportedSvgoVersions } from "../svgo";

interface Config {
  readonly ignoreGlobs: InputValue<string[]>;
  readonly isDryRun: InputValue<boolean>;
  readonly isStrictMode: InputValue<boolean>;
  readonly svgoConfigPath: InputValue<string>;
  readonly svgoVersion: InputValue<SupportedSvgoVersions>;
}

interface Inputter {
  getBooleanInput(name: string, options: InputterOptions): boolean;
  getInput(name: string, options: InputterOptions): string;
  getMultilineInput(name: string, options: InputterOptions): string[];
}

interface InputterOptions {
  readonly required?: boolean;
}

interface InputValue<T> {
  readonly provided: boolean;
  readonly value: T;
}

export type {
  Config,
  Inputter,
  InputterOptions,
  InputValue,
};
