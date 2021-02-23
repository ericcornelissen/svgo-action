// Action events
export const EVENT_PULL_REQUEST = "pull_request";
export const EVENT_PUSH = "push";
export const EVENT_SCHEDULE = "schedule";

// Action configuration
export const INPUT_NAME_COMMENT = "comment";
export const INPUT_NAME_CONFIG_PATH = "configuration-path";
export const INPUT_NAME_DRY_RUN = "dry-run";
export const INPUT_NAME_IGNORE = "ignore";
export const INPUT_NAME_REPO_TOKEN = "repo-token";
export const INPUT_NAME_SVGO_OPTIONS = "svgo-options";
export const INPUT_NAME_SVGO_VERSION = "svgo-version";

// Action defaults
export const DEFAULT_COMMENT = `
  SVG(s) automatically optimized using [SVGO] :sparkles:

  {{filesTable}}

  {{warnings}}

  [SVGO]: https://github.com/svg/svgo
`;

// Action outputs
export const OUTPUT_NAME_DID_OPTIMIZE = "DID_OPTIMIZE";
export const OUTPUT_NAME_OPTIMIZED_COUNT = "OPTIMIZED_COUNT";
export const OUTPUT_NAME_SKIPPED_COUNT = "SKIPPED_COUNT";
export const OUTPUT_NAME_SVG_COUNT = "SVG_COUNT";

// File encodings
export const BASE64 = "base64";
export const UTF8 = "utf-8";

// Special values
export const PR_NOT_FOUND = -1;
