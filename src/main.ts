import * as core from "@actions/core";
import * as github from "@actions/github";
import { Octokit } from "@octokit/core";

import {
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
  INPUT_NAME_CONFIG_PATH,
  INPUT_NAME_REPO_TOKEN,
} from "./constants";
import * as fs from "./file-system";
import { ActionConfig } from "./inputs";
import { SVGOptimizer, SVGOptions } from "./svgo";
import { RawActionConfig } from "./types";
import optimize from "./optimize";
import shouldSkipRun from "./skip-run";
import { getOutputNamesFor, setOutputValues } from "./outputs";

import { fetchJsFile } from "./utils/fetch-js";
import { fetchYamlFile } from "./utils/fetch-yaml";


const SUPPORTED_EVENTS: string[] = [
  EVENT_PULL_REQUEST,
  EVENT_PUSH,
  EVENT_SCHEDULE,
];

function getConfigFilePath(): string {
  return core.getInput(INPUT_NAME_CONFIG_PATH, { required: false });
}

function getRepoToken(): string {
  return core.getInput(INPUT_NAME_REPO_TOKEN, { required: true });
}

async function getSvgoConfigFile(
  client: Octokit,
  contextRef: string,
  path: string,
): SVGOptions {
  if (path.endsWith(".js")) {
    return await fetchJsFile(client, contextRef, path);
  } else {
    return await fetchYamlFile(client, contextRef, path);
  }
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
    const outputNames = getOutputNamesFor(event);
    setOutputValues(outputNames, optimizeData);
  } catch (error) {
    core.setFailed(`action failed with error '${error}'`);
  }
}


export default async function main(): Promise<void> {
  const contextRef: string = github.context.sha;
  const token: string = getRepoToken();
  const client: Octokit = github.getOctokit(token);

  const configFilePath: string = getConfigFilePath();
  const rawConfig: RawActionConfig = await fetchYamlFile(
    client,
    contextRef,
    configFilePath,
  );

  const config: ActionConfig = new ActionConfig(core, rawConfig);
  if (config.isDryRun) {
    core.info("Dry mode enabled, no changes will be written");
  }

  core.info(`Using SVGO major version ${config.svgoVersion}`);
  const svgoOptions: SVGOptions = await getSvgoConfigFile(
    client,
    contextRef,
    config.svgoOptionsPath,
  );
  const svgo: SVGOptimizer = new SVGOptimizer(config.svgoVersion, svgoOptions);

  const skip = await shouldSkipRun(client, github.context);
  if (!skip.shouldSkip) {
    run(config, svgo, github.context.eventName);
  } else {
    core.info(`Action disabled from ${skip.reason}, exiting`);
  }
}

main();
