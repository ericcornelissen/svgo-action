import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";

import { RawActionConfig, ActionConfig } from "../src/inputs";
import { formatTemplate } from "../src/templating";


const BOOLEAN = "boolean";
const STRING = "string";

const TRUE_STRING = "true";
const FALSE_STRING = "false";

const EXAMPLE_FILE_COUNT = 5;
const EXAMPLE_SVG_COUNT = 4;
const EXAMPLE_OPTIMIZED_COUNT = 3;
const EXAMPLE_SKIPPED_COUNT = 3;
const EXAMPLE_FILE_LIST = ["foo.svg", "bar.svg", "foobar.svg"];


function getExampleTemplate(title: string, description: string): string {
  return formatTemplate(
    title, description, {
      fileCount: EXAMPLE_FILE_COUNT,
      filePaths: EXAMPLE_FILE_LIST,
      optimizedCount: EXAMPLE_OPTIMIZED_COUNT,
      skippedCount: EXAMPLE_SKIPPED_COUNT,
      svgCount: EXAMPLE_SVG_COUNT,
    },
  )
}


function error(msg: string): string {
  return `[E] ${msg}`;
}

function warning(msg: string): string {
  return `[W] ${msg}`;
}

function suggest(msg: string): string {
  return `[S] ${msg}`;
}


function getConfigObject(file: string): any {
  const configFile: string = path.resolve(__dirname, "..", file);
  const configString: string = fs.readFileSync(configFile).toString();
  return yaml.safeLoad(configString);
}


function checkKeysInCommit(commitObject: any): void {
  if (commitObject === undefined) {
    return
  }

  const KNOWN_KEYS: string[] = ["conventional", "title", "description"];
  for (const key of Object.keys(commitObject)) {
    if (!KNOWN_KEYS.includes(key)) {
      warning(`Unknown key '${key}' in commit`);
    }
  }
}

function checkKeysInConfig(configObject: any): void {
  const KNOWN_KEYS: string[] = ["commit", "dry-run", "svgo-options"];
  for (const key of Object.keys(configObject)) {
    if (!KNOWN_KEYS.includes(key)) {
      warning(`Unknown key '${key}'`);
    }
  }

  checkKeysInCommit(configObject.commit);
}


function checkValueOfDryRun(dryRun?: boolean | string): string {
  if (dryRun !== undefined) {
    if (typeof dryRun === STRING) {
      if (dryRun === TRUE_STRING || dryRun === FALSE_STRING) {
        return suggest("change the dry-run value to a boolean (instead of a string)");
      }
    }

    if (typeof dryRun !== BOOLEAN) {
      return error(`Unknown value for dry-run '${dryRun}'`);
    }
  }

  return "";
}

function checkValueOfSvgoOptions(svgoOptions?: string): string {
  if (svgoOptions !== undefined) {
    if (typeof svgoOptions !== STRING) {
      return error(`Unknown value for svgo-options '${svgoOptions}'`);
    }

    if (!(svgoOptions.endsWith(".yaml") || svgoOptions.endsWith(".yml"))) {
      return warning("the svgo-options file does not look like a YAML file")
    }
  }

  return "";
}

function checkValueOfCommitConventional(conventional?: boolean | string): string {
  if (conventional !== undefined) {
    if (typeof conventional === STRING) {
      if (conventional === TRUE_STRING || conventional === FALSE_STRING) {
        return suggest("change the commit.conventional value to a boolean (instead of a string)");
      }
    }

    if (typeof conventional !== BOOLEAN) {
      return error(`Unknown value for commit.conventional '${conventional}'`);
    }
  }

  return "";
}

function checkValueOfCommitTitle(title?: string, conventional?: boolean | string): string {
  if (title !== undefined) {
    if (typeof title !== STRING) {
      return error(`Unknown value for commit.title '${title}'`);
    }

    if (conventional === true || conventional === TRUE_STRING) {
      return warning("commit.conventional currently overrides commit.title");
    }

    if (title.includes("\n")) {
      return warning("The commit title should not contains newlines");
    }

    const exampleTitle: string = getExampleTemplate(title, "");
    if (exampleTitle.length > 50) {
      return suggest(`Keep the commit title shorter than 50 characters, example:\n ${exampleTitle}`);
    }
  }

  return "";
}

function checkValueOfCommitDescription(description?: string): string {
  if (description !== undefined) {
    if (typeof description !== STRING) {
      return error(`Unknown value for commit.description '${description}'`);
    }
  }

  return "";
}

function checkValueOfCommit(commit?: RawActionConfig["commit"]): string[] {
  const report: string[] = [];
  if (commit !== undefined) {
    report.push(checkValueOfCommitConventional(commit.conventional));
    report.push(checkValueOfCommitTitle(commit.title, commit.conventional));
    report.push(checkValueOfCommitDescription(commit.description));
  }

  return report;
}

function checkValuesInConfig(configObject: RawActionConfig): string[] {
  const report: string[] = [];
  report.push(checkValueOfDryRun(configObject["dry-run"]));
  report.push(checkValueOfSvgoOptions(configObject["svgo-options"]));
  report.push(...checkValueOfCommit(configObject.commit));

  return report;
}


function analyze(configObject: any): [ActionConfig, string[], string] {
  const rawConfig: RawActionConfig = configObject as RawActionConfig;

  checkKeysInConfig(configObject);
  const report: string[] = checkValuesInConfig(rawConfig);
  const config: ActionConfig = new ActionConfig(rawConfig);
  const exampleCommit: string = getExampleTemplate(
    config.commitTitle,
    config.commitDescription
  );

  return [config, report.filter(x => x !== ""), exampleCommit];
}

function main(configFile: string): void {
  const rawConfigObject: any = getConfigObject(configFile);
  const [config, report, exampleCommit] = analyze(rawConfigObject);

  console.log("\nReport:\n=======");
  console.log(report.join("\n"));
  console.log("\Raw Config:\n===========");
  console.log(config);
  console.log("\nExample commit:\n===============");
  console.log(exampleCommit);

  // TODO
}

main(process.argv[2]);
