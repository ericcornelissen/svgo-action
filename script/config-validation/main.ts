import {
  INPUT_NAME_COMMENT,
  INPUT_NAME_CONFIG_PATH,
  INPUT_NAME_CONVENTIONAL_COMMITS,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_REPO_TOKEN,
  INPUT_NAME_SVGO_OPTIONS,
  CONFIG_NAME_COMMIT,
  CONFIG_NAME_COMMIT_CONVENTIONAL,
  CONFIG_NAME_COMMIT_TITLE,
  CONFIG_NAME_COMMIT_BODY,
} from "../../src/constants";
import { ActionConfig } from "../../src/inputs";
import { formatComment, formatCommitMessage } from "../../src/templating";
import { CommitData, Inputs, RawActionConfig } from "../../src/types";

import {
  // Strings
  commitTitleNoNewLines,
  conventionalCommitOverridesCommitTitle,
  repoTokenValue,

  // Formatters
  incorrectFileType,
  isRequired,
  unknownKey,
  unknownValueFor,
  useBoolInsteadOfString,
} from "./messages";


type Commit = {
  readonly body?: string;
  readonly conventional?: boolean;
  readonly title?: string;
};

type Jobs = [{ steps: any[] }];


const BOOLEAN = "boolean";
const FALSE_STRING = "false";
const STRING = "string";
const TRUE_STRING = "true";

const DEFAULT_COMMENT = "false";
const DEFAULT_CONFIGURATION_PATH = ".github/svgo-action.yml";
const DEFAULT_CONVENTIONAL_COMMITS = "false";
const DEFAULT_DRY_RUN = "false";
const DEFAULT_IGNORE = "";
const DEFAULT_SVGO_OPTIONS = ".svgo.yml";

const ALLOWED_KEYS_FILE = [
  INPUT_NAME_COMMENT,
  CONFIG_NAME_COMMIT,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_SVGO_OPTIONS,
];
const ALLOWED_KEYS_COMMIT = [
  CONFIG_NAME_COMMIT_CONVENTIONAL,
  CONFIG_NAME_COMMIT_TITLE,
  CONFIG_NAME_COMMIT_BODY,
];
const ALLOWED_KEYS_WORKFLOW = [
  INPUT_NAME_COMMENT,
  INPUT_NAME_CONFIG_PATH,
  INPUT_NAME_CONVENTIONAL_COMMITS,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_IGNORE,
  INPUT_NAME_REPO_TOKEN,
  INPUT_NAME_SVGO_OPTIONS,
];

const EXAMPLE_COMMIT_DATA: CommitData = {
  fileCount: 5,
  fileData: {
    optimized: [
      {
        content: "foo",
        originalEncoding: "base64",
        path: "foo.svg",
      },
      {
        content: "bar",
        originalEncoding: "base64",
        path: "bar.svg",
      },
      {
        content: "foobar",
        originalEncoding: "base64",
        path: "foobar.svg",
      },
    ],
    original: [
      {
        content: "foobar",
        originalEncoding: "base64",
        path: "foo.svg",
      },
      {
        content: "foobar",
        originalEncoding: "base64",
        path: "bar.svg",
      },
      {
        content: "foobarr",
        originalEncoding: "base64",
        path: "foobar.svg",
      },
      {
        content: "",
        originalEncoding: "base64",
        path: "optimized.svg",
      },
    ],
  },
  ignoredCount: 0,
  optimizedCount: 3,
  skippedCount: 1,
  svgCount: 4,
};


class Report {

  readonly messages: string[];
  private readonly config?: ActionConfig;

  constructor(messages: string[], config?: ActionConfig) {
    this.messages = messages.filter((s: string): boolean => s !== "");
    this.config = config;
  }

  exampleComment(): string {
    if (this.config === undefined) {
      return "";
    }

    return formatComment(this.config.comment, EXAMPLE_COMMIT_DATA);
  }

  exampleCommitMessage(): string {
    if (this.config === undefined) {
      return "";
    }

    return formatCommitMessage(
      this.config.commitTitle,
      this.config.commitBody,
      EXAMPLE_COMMIT_DATA,
    );
  }

}


function getInputsInstance(configObject: RawActionConfig): Inputs {
  return {
    getInput(name: string, _: any): string {
      const get = (v: any, f: string): string => v == undefined ? f : v;

      switch (name) {
        case INPUT_NAME_COMMENT:
          return get(configObject.comment, DEFAULT_COMMENT);
        case INPUT_NAME_CONFIG_PATH:
          return get(
            configObject["configuration-path"],
            DEFAULT_CONFIGURATION_PATH,
          );
        case INPUT_NAME_CONVENTIONAL_COMMITS:
          return get(
            configObject["conventional-commits"],
            DEFAULT_CONVENTIONAL_COMMITS,
          );
        case INPUT_NAME_DRY_RUN:
          return get(configObject["dry-run"], DEFAULT_DRY_RUN);
        case INPUT_NAME_IGNORE:
          return get(configObject.ignore, DEFAULT_IGNORE);
        case INPUT_NAME_SVGO_OPTIONS:
          return get(configObject["svgo-options"], DEFAULT_SVGO_OPTIONS);
        default:
          return "";
      }
    },
  };
}


function isBooleanString(value?: boolean | string): boolean {
  return value === TRUE_STRING || value === FALSE_STRING;
}

function isYamlFile(filepath: string): boolean {
  return filepath.endsWith(".yaml") || filepath.endsWith(".yml");
}


function checkKeysInConfig(configObject: any, allowed: string[]): string[] {
  const report: string[] = [];
  for (const key of Object.keys(configObject)) {
    if (!allowed.includes(key)) {
      report.push(unknownKey(`Unknown key '${key}'`));
    }
  }

  return report;
}

function checkKeysInCommit(commitObject: any): string[] {
  const report: string[] = [];
  if (commitObject === undefined) {
    return report;
  }

  return checkKeysInConfig(commitObject, ALLOWED_KEYS_COMMIT);
}


function checkValueOfComment(value?: string | boolean): string {
  const keyName = "comment";
  if (value !== undefined) {
    if (typeof value === STRING) {
      if (isBooleanString(value)) {
        return useBoolInsteadOfString(keyName);
      } else {
        // value is a template for the comment content
        return "";
      }
    }

    if (typeof value !== BOOLEAN) {
      return unknownValueFor(keyName, value);
    }
  }

  return "";
}

function checkValueOfConfigPath(value?: string): string {
  const keyName = "configuration-path";
  if (value !== undefined) {
    if (typeof value !== STRING) {
      return unknownValueFor(keyName, value);
    }

    if (!isYamlFile(value)) {
      return incorrectFileType(keyName, "YAML");
    }
  }

  return "";
}

function checkValueOfConvCommit(value?: boolean | string): string {
  const keyName = "commit.conventional";
  if (value !== undefined) {
    if (typeof value === STRING) {
      if (isBooleanString(value)) {
        return useBoolInsteadOfString(keyName);
      }
    }

    if (typeof value !== BOOLEAN) {
      return unknownValueFor(keyName, value);
    }
  }

  return "";
}

function checkValueOfCommitTitle(
  value?: string,
  conventional?: boolean | string,
): string {
  const keyName = "commit.title";
  if (value !== undefined) {
    if (typeof value !== STRING) {
      return unknownValueFor(keyName, value);
    }

    if (conventional === true || conventional === TRUE_STRING) {
      return conventionalCommitOverridesCommitTitle;
    }

    if (value.includes("\n")) {
      return commitTitleNoNewLines;
    }
  }

  return "";
}

function checkValueOfCommitBody(value?: string): string {
  const keyName = "commit.body";
  if (value !== undefined) {
    if (typeof value !== STRING) {
      return unknownValueFor(keyName, value);
    }
  }

  return "";
}

function checkValueOfCommit(commit?: Commit): string[] {
  const report: string[] = [];
  if (commit !== undefined) {
    report.push(checkValueOfConvCommit(commit.conventional));
    report.push(checkValueOfCommitTitle(commit.title, commit.conventional));
    report.push(checkValueOfCommitBody(commit.body));
  }

  return report;
}

function checkValueOfDryRun(value?: boolean | string): string {
  const keyName = "dry-run";
  if (value !== undefined) {
    if (typeof value === STRING) {
      if (isBooleanString(value)) {
        return useBoolInsteadOfString(keyName);
      }
    }

    if (typeof value !== BOOLEAN) {
      return unknownValueFor(keyName, value);
    }
  }

  return "";
}

function checkValueOfIgnore(value?: string): string {
  const keyName = "ignore";
  if (value !== undefined) {
    if (typeof value !== STRING) {
      return unknownValueFor(keyName, value);
    }
  }

  return "";
}

function checkValueOfRepoToken(value?: string): string {
  const keyName = "repo-token";
  if (value === undefined) {
    return isRequired(keyName);
  }

  if (value !== "${{ secrets.GITHUB_TOKEN }}") {
    return repoTokenValue;
  }

  return "";
}

function checkValueOfSvgoOptions(value?: string): string {
  const keyName = "svgo-options";
  if (value !== undefined) {
    if (typeof value !== STRING) {
      return unknownValueFor(keyName, value);
    }

    if (!isYamlFile(value)) {
      return incorrectFileType(keyName, "YAML");
    }
  }

  return "";
}


function analyzeConfigFile(configObject: RawActionConfig): Report {
  const report: string[] = [];
  report.push(...checkKeysInConfig(configObject, ALLOWED_KEYS_FILE));
  report.push(...checkKeysInCommit(configObject.commit));
  report.push(...checkValueOfCommit(configObject.commit));
  report.push(checkValueOfComment(configObject.comment));
  report.push(checkValueOfDryRun(configObject["dry-run"]));
  report.push(checkValueOfIgnore(configObject.ignore));
  report.push(checkValueOfSvgoOptions(configObject["svgo-options"]));

  const defaultInputs: Inputs = getInputsInstance({ });
  const config: ActionConfig = new ActionConfig(defaultInputs, configObject);

  return new Report(report, config);
}

function analyzeWorkflowFile(jobs: Jobs): Report {
  function doAnalyze(configObject: RawActionConfig): Report {
    const report: string[] = [];
    report.push(...checkKeysInConfig(configObject, ALLOWED_KEYS_WORKFLOW));
    report.push(checkValueOfComment(configObject.comment));
    report.push(checkValueOfConfigPath(configObject["configuration-path"]));
    report.push(checkValueOfConvCommit(configObject["conventional-commits"]));
    report.push(checkValueOfDryRun(configObject["dry-run"]));
    report.push(checkValueOfIgnore(configObject.ignore));
    report.push(checkValueOfRepoToken(configObject["repo-token"]));
    report.push(checkValueOfSvgoOptions(configObject["svgo-options"]));

    const inputs: Inputs = getInputsInstance(configObject);
    const config: ActionConfig = new ActionConfig(inputs, { });

    return new Report(report, config);
  }

  for (const pipeline of Object.values(jobs)) {
    for (const step of pipeline.steps) {
      if (step.uses && step.uses.includes("ericcornelissen/svgo-action")) {
        return doAnalyze(step.with);
      }
    }
  }

  return new Report(["[F] svgo-action not found in Workflow file"]);
}

export function analyze(configObject: any): {
  type: string,
  messages: string[],
  comment: string,
  commit: string,
} {
  let report: Report;
  let type: string;

  if (configObject.jobs !== undefined) {
    type = "Workflow";
    report = analyzeWorkflowFile(configObject.jobs);
  } else {
    type = "Config";
    report = analyzeConfigFile(configObject);
  }

  return {
    type: type,
    messages: report.messages,
    comment: report.exampleComment(),
    commit: report.exampleCommitMessage(),
  };
}
