import type { error } from "./errors";
import type { Outputter } from "./outputs";
import type { GitHub as _GitHub } from "@actions/github/lib/utils";

interface Context {
  readonly eventName: string;
  readonly payload: {
    readonly commits?: {
      readonly id: string;
    }[];
    readonly pull_request?: {
      readonly number: number;
    };
  };
  readonly repo: {
    readonly owner: string;
    readonly repo: string;
  };
}

interface Core extends Inputter, Outputter {
  debug(message: string): void;
  info(message: string): void;
  setFailed(message: string | Error): void;
  warning(message: string | Error): void;
}

interface GitHub {
  readonly context: Context;
  getOctokit(token: string): Octokit;
}

interface Inputter {
  getBooleanInput(name: string, options: InputterOptions): boolean;
  getInput(name: string, options: InputterOptions): string;
  getMultilineInput(name: string, options: InputterOptions): string[];
}

interface InputterOptions {
  readonly required?: boolean;
}

type Octokit = InstanceType<typeof _GitHub>;

export type {
  Context,
  Core,
  error,
  GitHub,
  Inputter,
  InputterOptions,
  Octokit,
};
