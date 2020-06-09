// Action configuration
export const INPUT_NAME_COMMENT = "comment";
export const INPUT_NAME_CONFIG_PATH = "configuration-path";
export const INPUT_NAME_CONVENTIONAL_COMMITS = "conventional-commits";
export const INPUT_NAME_DRY_RUN = "dry-run";
export const INPUT_NAME_IGNORE = "ignore";
export const INPUT_NAME_REPO_TOKEN = "repo-token";
export const INPUT_NAME_SVGO_OPTIONS = "svgo-options";

export const DISABLE_PATTERN = /disable-svgo-action/;
export const ENABLE_PATTERN = /enable-svgo-action/;

// Action defaults
export const CONVENTIONAL_COMMIT_TITLE =
  "chore: optimize {{optimizedCount}} SVG(s)";
export const DEFAULT_COMMIT_BODY =
  "Optimized SVG(s):\n{{filesList}}";
export const DEFAULT_COMMIT_TITLE =
  "Optimize {{optimizedCount}} SVG(s) with SVGO";
export const DEFAULT_COMMENT = `
  SVG(s) automatically optimized using [SVGO] :sparkles:

  {{filesTable}}

  [SVGO]: https://github.com/svg/svgo
`;

// File encodings
export const BASE64 = "base64";
export const UTF8 = "utf-8";

// Git and GitHub
export const COMMIT_MODE_FILE = "100644";
export const COMMIT_TYPE_BLOB = "blob";

export const STATUS_ADDED = "added";
export const STATUS_MODIFIED = "modified";

// Special values
export const PR_NOT_FOUND = -1;
