/* eslint-disable @typescript-eslint/no-explicit-any */

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


type Commit = { conventional: boolean; body: string; title: string };

type Jobs = [{ steps: any[] }];

type Report = string[];


const BOOLEAN = "boolean";
const STRING = "string";

const TRUE_STRING = "true";
const FALSE_STRING = "false";

const ALLOWED_KEYS_FILE = ["comment", "commit", "dry-run", "ignore", "svgo-options"];
const ALLOWED_KEYS_COMMIT = ["conventional", "title", "body"];
const ALLOWED_KEYS_WORKFLOW = ["repo-token", "comment", "configuration-path", "conventional-commits", "dry-run", "ignore", "svgo-options"];

const emptyString = (s: string): boolean => s !== "";


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


function checkValueOfComment(value?: string): string {
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

function checkValueOfConfigurationPath(value?: string): string {
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

function checkValueOfCommitConventional(value?: boolean | string): string {
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

function checkValueOfCommitTitle(value?: string, conventional?: boolean | string): string {
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
    report.push(checkValueOfCommitConventional(commit.conventional));
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


function analyzeConfigFile(configObject: any): Report {
  const report: Report = [];
  report.push(...checkKeysInConfig(configObject, ALLOWED_KEYS_FILE));
  report.push(...checkKeysInCommit(configObject.commit));
  report.push(...checkValueOfCommit(configObject.commit));
  report.push(checkValueOfComment(configObject.comment));
  report.push(checkValueOfDryRun(configObject["dry-run"]));
  report.push(checkValueOfIgnore(configObject.ignore));
  report.push(checkValueOfSvgoOptions(configObject["svgo-options"]));

  return report.filter(emptyString);
}

function analyzeWorkflowFile(jobs: Jobs): Report {
  function doAnalyze(configObject: any): Report {
    const report: Report = [];
    report.push(...checkKeysInConfig(configObject, ALLOWED_KEYS_WORKFLOW));
    report.push(checkValueOfComment(configObject.comment));
    report.push(checkValueOfConfigurationPath(configObject["configuration-path"]));
    report.push(checkValueOfCommitConventional(configObject["conventional-commits"]));
    report.push(checkValueOfDryRun(configObject["dry-run"]));
    report.push(checkValueOfIgnore(configObject.ignore));
    report.push(checkValueOfRepoToken(configObject["repo-token"]));
    report.push(checkValueOfSvgoOptions(configObject["svgo-options"]));

    return report.filter(emptyString);
  }

  for (const pipeline of Object.values(jobs)) {
    for (const step of pipeline.steps) {
      if (step.uses && step.uses.includes("ericcornelissen/svgo-action")) {
        return doAnalyze(step.with);
      }
    }
  }

  return ["[F] svgo-action not found in Workflow file"];
}

export function analyze(configObject: any): [string, Report] {
  if (configObject.jobs !== undefined) {
    return ["Workflow", analyzeWorkflowFile(configObject.jobs)];
  } else {
    return ["Config", analyzeConfigFile(configObject)];
  }
}
