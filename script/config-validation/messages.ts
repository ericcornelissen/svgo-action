function error(msg: string): string {
  return `[E] ${msg}`;
}

function warning(msg: string): string {
  return `[W] ${msg}`;
}

function suggest(msg: string): string {
  return `[S] ${msg}`;
}


export const commitTitleNoNewLines = warning(
  "The commit title should not contains newlines",
);

export const conventionalCommitOverridesCommitTitle = warning(
  "commit.conventional currently overrides commit.title",
);

export const repoTokenValue = error(
  "repo-token value must be ${{ secrets.GITHUB_TOKEN }}",
);


export function incorrectFileType(key: string, filetype: string): string {
  return warning(`the ${key} file does not look like a ${filetype} file`);
}

export function isRequired(key: string): string {
  return error(`${key} is required but was not found`);
}

export function unknownKey(key: string): string {
  return warning(`Unknown key ${key}`);
}

export function unknownValueFor(key: string, actualValue: any): string {
  return error(`Unknown value for ${key} '${actualValue}'`);
}

export function useBoolInsteadOfString(key: string): string {
  return suggest(`change the ${key} value to a boolean (instead of a string)`);
}
