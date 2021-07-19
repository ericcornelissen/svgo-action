// Type representing the relevant information of `@actions/github.context`.
export type Client = {
  readonly rest: {
    readonly pulls: {
      listFiles(params: {
        owner: string;
        repo: string;
        pull_number: number;
        per_page?: number;
        page?: number;
      }): Promise<{
        data: { filename: string; status: string; }[]
      }>;
    };
  };
}

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
export interface Inputter {
  getInput(name: string, options: { required?: boolean; }): string;
}

// Type representing an object to which Action outputs can be outputted.
export interface Outputter {
  setOutput(name: string, value: string): void;
}

// Types representing Action run warnings
export type Warning = string;
export type Warnings = Warning[];
