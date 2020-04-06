import * as fs from "fs";
import * as yaml from "js-yaml";
import * as path from "path";


type Jobs = [{ steps: any[] }];
type Commit = { conventional: boolean, description: string, title: string };
type Report = string[];


const BOOLEAN = "boolean";
const STRING = "string";

const TRUE_STRING = "true";
const FALSE_STRING = "false";

const ALLOWED_KEYS_FILE = ["commit", "dry-run", "svgo-options"];
const ALLOWED_KEYS_COMMIT = ["conventional", "title", "description"];
const ALLOWED_KEYS_WORKFLOW = ["repo-token", "configuration-path", "conventional-commits", "dry-run", "svgo-options"];


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


function checkKeysInConfig(configObject: any, allowed: string[]): string[] {
  const report: string[] = [];
  for (const key of Object.keys(configObject)) {
    if (!allowed.includes(key)) {
      report.push(warning(`Unknown key '${key}'`));
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


function checkValueOfConfigurationPath(configurationPath?: string): string {
  if (configurationPath !== undefined) {
    if (typeof configurationPath !== STRING) {
      return error(`Unknown value for configuration-path '${configurationPath}'`);
    }

    if (!(configurationPath.endsWith(".yaml") || configurationPath.endsWith(".yml"))) {
      return warning("the configuration-path file does not look like a YAML file")
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

function checkValueOfCommit(commit?: Commit): string[] {
  const report: string[] = [];
  if (commit !== undefined) {
    report.push(checkValueOfCommitConventional(commit.conventional));
    report.push(checkValueOfCommitTitle(commit.title, commit.conventional));
    report.push(checkValueOfCommitDescription(commit.description));
  }

  return report;
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

function checkValueOfRepoToken(repoToken?: string): string {
  if (repoToken === undefined) {
    return error("Repo token is required but was not found");
  }

  if (repoToken !== "${{ secrets.GITHUB_TOKEN }}") {
    return error("Repo token must be ${{ secrets.GITHUB_TOKEN }}");
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


function analyzeConfigFile(configObject: any): Report {
  const report: Report = [];
  report.push(...checkKeysInConfig(configObject, ALLOWED_KEYS_FILE));
  report.push(...checkKeysInCommit(configObject.commit));
  report.push(...checkValueOfCommit(configObject.commit));
  report.push(checkValueOfDryRun(configObject["dry-run"]));
  report.push(checkValueOfSvgoOptions(configObject["svgo-options"]));

  return report;
}

function analyzeWorkflowFile(jobs: Jobs): Report {
  function doAnalyze(configObject: any): Report {
    const report: Report = [];
    report.push(...checkKeysInConfig(configObject, ALLOWED_KEYS_WORKFLOW));
    report.push(checkValueOfConfigurationPath(configObject["configuration-path"]));
    report.push(checkValueOfCommitConventional(configObject["conventional-commits"]));
    report.push(checkValueOfDryRun(configObject["dry-run"]));
    report.push(checkValueOfRepoToken(configObject["repo-token"]));
    report.push(checkValueOfSvgoOptions(configObject["svgo-options"]));

    return report;
  }

  for (const pipeline of Object.values(jobs)) {
    for (const step of pipeline.steps) {
      if (step.uses && step.uses.includes("ericcornelissen/svgo-action")) {
        return doAnalyze(step.with);
      }
    }
  }

  return [error("svgo-action not found in Workflow file")];
}

function analyze(configObject: any): Report {
  if (configObject.jobs !== undefined) {
    console.log("Workflow file detected");
    return analyzeWorkflowFile(configObject.jobs);
  } else {
    console.log("Config file detected");
    return analyzeConfigFile(configObject);
  }
}


function main(configFile: string): void {
  const rawConfigObject: any = getConfigObject(configFile);
  const report: Report = analyze(rawConfigObject);

  console.log("\nReport:\n=======");
  console.log(report.filter(x => x !== "").join("\n"));
}

main(process.argv[2]);
