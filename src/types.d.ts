export type error = string | null;

// Type representing the relevant information of `@actions/github.context`.
export type Context = {
  readonly eventName: string;
  readonly payload: {
    readonly pull_request?: {
      readonly number: number;
    };
  };
  readonly repo: {
    readonly owner: string;
    readonly repo: string;
  };
}

// Type representing the relevant information of `@actions/core`.
export interface Core extends Inputter, Outputter {
  info(message: string): void;
  setFailed(message: string | Error): void;
  warning(message: string | Error): void;
  debug(message: string): void;
}

// Type representing data about the optimization process.
export type OptimizeProjectData = {
  readonly ignoredCount: number;
  readonly optimizedCount: number;
  readonly svgCount: number;
}

// Type representing the data of a file that is being processed by the Action.
export type FileData = {
  readonly content: string;
  readonly originalEncoding: string;
  readonly path: string;
}

// Type representing an object from which the Action inputs can be obtained.
interface InputterOptions {
  readonly required?: boolean;
}

export interface Inputter {
  getInput(name: string, options: InputterOptions): string;
  getBooleanInput(name: string, options: InputterOptions): boolean;
}

// Type representing an object to which Action outputs can be outputted.
export interface Outputter {
  setOutput(name: string, value: string): void;
}

export interface GitHub {
  getOctokit(token: string): Client;
  readonly context: Context;
}
