/* eslint-disable security/detect-non-literal-fs-filename */

import type { Octokit } from "@octokit/core";

import * as core from "@actions/core";
import * as github from "@actions/github";

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
  INPUT_NAME_CONFIG_PATH,
  INPUT_NAME_REPO_TOKEN,
  INPUT_NOT_REQUIRED,
  INPUT_REQUIRED,
} from "./constants";
import * as fs from "./file-system";
import { ActionConfig } from "./inputs";
import { parseJavaScript, parseYaml } from "./parser";
import { SVGOptimizer, SVGOptions } from "./svgo";
import { RawActionConfig } from "./types";
import { optimize } from "./optimize";
import { shouldSkipRun } from "./skip-run";
import { setOutputValues } from "./outputs";


const SUPPORTED_EVENTS: string[] = [
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
];

function getRepoToken(): string {
  return core.getInput(INPUT_NAME_REPO_TOKEN, INPUT_REQUIRED);
}

async function getActionConfig(): Promise<ActionConfig> {
  const filePath = core.getInput(INPUT_NAME_CONFIG_PATH, INPUT_NOT_REQUIRED);

  let rawConfig: RawActionConfig | undefined;
  try {
    const rawConfigYaml = await fs.readFile(filePath);
    rawConfig = parseYaml(rawConfigYaml);
  } catch (_) {
    core.warning(`Action config file '${filePath}' not found or invalid`);
  }

  return new ActionConfig(core, rawConfig);
}

async function getSvgoInstance(config: ActionConfig): Promise<SVGOptimizer> {
  const filePath = config.svgoOptionsPath;

  let options: SVGOptions | undefined;
  try {
    const rawOptions = await fs.readFile(filePath);
    options = config.svgoVersion === 2 ?
      parseJavaScript(rawOptions) :
      parseYaml(rawOptions);
  } catch(_) {
    core.warning(`SVGO config file '${filePath}' not found or invalid`);
  }

  return new SVGOptimizer(config.svgoVersion, options);
}

async function run(
  config: ActionConfig,
  svgo: SVGOptimizer,
  event: string,
): Promise<void> {
  try {
    core.info(`Running SVGO Action in '${event}' context`);
    if (!SUPPORTED_EVENTS.includes(event)) {
      throw new Error(`Event '${event}' not supported`);
    }

    const optimizeData = await optimize(fs, config, svgo);
    setOutputValues(event, optimizeData);
  } catch (error) {
    core.setFailed(`action failed with error '${error}'`);
  }
}

export default async function main(): Promise<void> {
  const token: string = getRepoToken();
  const client: Octokit = github.getOctokit(token);

  const config = await getActionConfig();
  if (config.isDryRun) {
    core.info("Dry mode enabled, no changes will be written");
  }

  core.info(`Using SVGO major version ${config.svgoVersion}`);
  const svgo: SVGOptimizer = await getSvgoInstance(config);

  const skip = await shouldSkipRun(client, github.context);
  if (!skip.shouldSkip) {
    run(config, svgo, github.context.eventName);
  } else {
    core.info(`Action disabled from ${skip.reason}, exiting`);
  }
}

main();
