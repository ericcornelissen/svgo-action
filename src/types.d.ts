import type { GitHub as _GitHub } from "@actions/github/lib/utils";

// Type representing the relevant API of `@actions/github.context`.
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

// Type representing the relevant API of `@actions/core`.
interface Core extends Inputter, Outputter {
  debug(message: string): void;
  info(message: string): void;
  setFailed(message: string | Error): void;
  warning(message: string | Error): void;
}

// Type for errors.
type error = string | null;

// Type representing the relevant API of `@actions/github`.
interface GitHub {
  readonly context: Context;
  getOctokit(token: string): Octokit;
}

// Type representing an object from which the Action inputs can be obtained.
interface Inputter {
  getBooleanInput(name: string, options: InputterOptions): boolean;
  getInput(name: string, options: InputterOptions): string;
  getMultilineInput(name: string, options: InputterOptions): string[];
}

// Type representing the options for the `Inputter` interface.
interface InputterOptions {
  readonly required?: boolean;
}

// Type representing `@actions/github`'s Octokit.
type Octokit = InstanceType<typeof _GitHub>;

// Type representing an object to which Action outputs can be outputted.
interface Outputter {
  setOutput(name: string, value: string): void;
}

export {
  Context,
  Core,
  error,
  GitHub,
  Inputter,
  InputterOptions,
  Octokit,
  Outputter,
};
