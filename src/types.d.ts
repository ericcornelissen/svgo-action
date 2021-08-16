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
  info(message: string): void;
  setFailed(message: string | Error): void;
  warning(message: string | Error): void;
  debug(message: string): void;
}

// Type for errors.
type error = string | null;

// Type representing the relevant API of `@actions/github`.
interface GitHub {
  getOctokit(token: string): Octokit;
  readonly context: Context;
}

// Type representing an object from which the Action inputs can be obtained.
interface Inputter {
  getInput(name: string, options: InputterOptions): string;
  getBooleanInput(name: string, options: InputterOptions): boolean;
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
  error,
  Context,
  Core,
  GitHub,
  Inputter,
  InputterOptions,
  Octokit,
  Outputter,
};
