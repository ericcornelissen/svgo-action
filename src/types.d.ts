type InputOptions = {
  required?: boolean;
}

export type OptimizeFileData = {
  contentAfter: string;
  contentBefore: string;
  path: string;
}

export type OptimizeProjectData = {
  readonly files: OptimizeFileData[];
  readonly optimizedCount: number;
  readonly skippedCount: number;
  readonly svgCount: number;
}

// Type representing the possible names of values outputted by the Action.
type OutputName =
  "DID_OPTIMIZE" |
  "OPTIMIZED_COUNT" |
  "SKIPPED_COUNT" |
  "SVG_COUNT";

// Type representing the data of a file that is being processed by the Action.
export type FileData = {
  readonly content: string;
  readonly originalEncoding: string;
  readonly path: string;
}

// Type representing an Action configuration file.
export type RawActionConfig = {
  readonly comment?: boolean | string;
  readonly "dry-run"?: boolean;
  readonly ignore?: string;
  readonly "svgo-options"?: string;
  readonly "svgo-version"?: number;
}

// Type representing the (relevant) data of a file in git.
export type GitFileData = {
  readonly content: string;
  readonly encoding: string;
  readonly path: string;
}

// Type representing an object from which the Action inputs can be obtained.
export type Inputs = {
  getInput(name: string, options: InputOptions): string;
}
