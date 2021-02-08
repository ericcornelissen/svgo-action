type InputOptions = {
  required?: boolean;
}

type Mode = "100644" | "100755" | "040000" | "160000" | "120000" | undefined;

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

// Type representing the data for the Action to create a commit.
export type CommitData = {
  readonly fileCount: number;
  readonly fileData: {
    readonly optimized: FileData[];
    readonly original: FileData[];
  };
  readonly ignoredCount: number;
  readonly optimizedCount: number;
  readonly skippedCount: number;
  readonly svgCount: number;
  readonly warnings: string[];
}

// Type representing the context w.r.t. files and SVGs the Action is running in.
export type ContextData = {
  readonly fileCount: number;
  readonly ignoredCount: number;
  readonly svgs: FileData[];
  readonly warnings: string[];
}

// Type representing an Action configuration file.
export type RawActionConfig = {
  readonly branch?: string;
  readonly comment?: boolean | string;
  readonly commit?: {
    readonly conventional?: boolean;
    readonly title?: string;
    readonly body?: string;
  };
  readonly "dry-run"?: boolean;
  readonly ignore?: string;
  readonly "svgo-options"?: string;
}

// Type representing the (relevant) data about a commit.
export type CommitInfo = {
  readonly sha: string;
  readonly url: string;
}

// Type representing a Binary Large OBject (blob) in git.
export type GitBlob = {
  readonly mode: Mode
  readonly path: string;
  readonly sha: string;
  readonly type: "blob" | "tree" | "commit" | undefined;
}

// Type representing the (relevant) data of a file in git.
export type GitFileData = {
  readonly content: string;
  readonly encoding: string;
  readonly path: string;
}

// Type representing the (relevant) information about a file in git.
export type GitFileInfo = {
  readonly path: string;
  readonly status: string;
}

// Type representing the (relevant) information about an object (file or
// directory) in git.
export type GitObjectInfo = {
  readonly path: string;
  readonly type: string;
}

// Type representing an object from which the Action inputs can be obtained.
export type Inputs = {
  getInput(name: string, options: InputOptions): string;
}
