/* eslint-disable security/detect-non-literal-fs-filename */

import type { Octokit } from "@octokit/core";

import * as core from "@actions/core";
import * as github from "@actions/github";

import {
  COMMENTABLE_EVENTS,
  DEFAULT_CONFIG_PATH,
  DEFAULT_SVGO_OPTIONS,
  INPUT_NAME_CONFIG_PATH,
  INPUT_NAME_REPO_TOKEN,
  INPUT_NOT_REQUIRED,
  INPUT_REQUIRED,
  SUPPORTED_EVENTS,
} from "./constants";
import * as fs from "./file-system";
import { createComment, getPrNumber } from "./github-api";
import { ActionConfig } from "./inputs";
import { parseJavaScript, parseYaml } from "./parser";
import { SVGOptimizer, SVGOptions } from "./svgo";
import { RawActionConfig, Warnings } from "./types";
import { optimize } from "./optimize";
import { setOutputValues } from "./outputs";
import { shouldSkipRun } from "./skip-run";
import { formatComment } from "./templating";


function getRepoToken(): string {
  return core.getInput(INPUT_NAME_REPO_TOKEN, INPUT_REQUIRED);
}

async function getActionConfig(): Promise<[ActionConfig, Warnings]> {
  const filePath = core.getInput(INPUT_NAME_CONFIG_PATH, INPUT_NOT_REQUIRED);
  const warnings: Warnings = [];

  let rawConfig: RawActionConfig | undefined;
  try {
    const rawConfigYaml = await fs.readFile(filePath);
    try {
      rawConfig = parseYaml(rawConfigYaml);
    } catch (_) {
      warnings.push(`Action config file '${filePath}' invalid`);
    }
  } catch (_) {
    if (filePath !== DEFAULT_CONFIG_PATH) {
      warnings.push(`Action config file '${filePath}' not found`);
    }
  }

  return [
    new ActionConfig(core, rawConfig),
    warnings,
  ];
}

async function getSvgoInstance(
  config: ActionConfig,
): Promise<[SVGOptimizer, Warnings]> {
  const filePath = config.svgoOptionsPath;
  const warnings: Warnings = [];

  let options: SVGOptions | undefined;
  try {
    const rawOptions = await fs.readFile(filePath);
    try {
      options = config.svgoVersion === 2 ?
        parseJavaScript(rawOptions) :
        parseYaml(rawOptions);
    } catch (_) {
      warnings.push(`SVGO config file '${filePath}' invalid`);
    }
  } catch (_) {
    if (filePath !== DEFAULT_SVGO_OPTIONS) {
      warnings.push(`SVGO config file '${filePath}' not found`);
    }
  }

  return [
    new SVGOptimizer(config.svgoVersion, options),
    warnings,
  ];
}

async function run(
  client: Octokit,
  config: ActionConfig,
  svgo: SVGOptimizer,
  warnings: Warnings,
  event: string,
): Promise<void> {
  try {
    core.info(`Running SVGO Action in '${event}' context`);
    if (!SUPPORTED_EVENTS.includes(event)) {
      throw new Error(`Event '${event}' not supported`);
    }

    const optimizeData = await optimize(fs, config, svgo);
    setOutputValues(event, optimizeData);

    if (COMMENTABLE_EVENTS.includes(event) && config.enableComments) {
      const prNumber = getPrNumber();
      core.info(`Creating comment in Pull Request #${prNumber}...`);
      const comment = formatComment(config.comment, optimizeData, warnings);
      await createComment(client, prNumber, comment);
    }
  } catch (error) {
    core.setFailed(`action failed with error '${error}'`);
  }
}

function logWarnings(warnings: Warnings): void {
  for (const warning of warnings) {
    core.warning(warning);
  }
}

export default async function main(): Promise<void> {
  const token: string = getRepoToken();
  const client: Octokit = github.getOctokit(token);
  const warnings: Warnings = [];

  const [config, configWarnings] = await getActionConfig();
  warnings.push(...configWarnings);
  if (config.isDryRun) {
    core.info("Dry mode enabled, no changes will be written");
  }

  core.info(`Using SVGO major version ${config.svgoVersion}`);
  const [svgo, svgoWarnings] = await getSvgoInstance(config);
  warnings.push(...svgoWarnings);

  const skip = await shouldSkipRun(client, github.context);
  if (!skip.shouldSkip) {
    run(client, config, svgo, warnings, github.context.eventName);
  } else {
    core.info(`Action disabled from ${skip.reason}, exiting`);
  }

  logWarnings(warnings);
}

main();
