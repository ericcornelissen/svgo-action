/* eslint-disable security/detect-non-literal-fs-filename */

import type { Context } from "@actions/github/lib/context";
import type { Octokit } from "@octokit/core";

import type { Warnings } from "./types";

import * as core from "@actions/core";

import {
  COMMENTABLE_EVENTS,
  DEFAULT_SVGO_OPTIONS,
  SUPPORTED_EVENTS,
} from "./constants";
import * as fs from "./file-system";
import { createComment, getPrNumber } from "./github-api";
import { ActionConfig } from "./inputs";
import { parseJavaScript, parseYaml } from "./parser";
import { SVGOptimizer, SVGOptions } from "./svgo";
import { optimize } from "./optimize";
import { setOutputValues } from "./outputs";
import { shouldSkipRun } from "./skip-run";
import { formatComment } from "./templating";

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

async function initAction(): Promise<[
  { config: ActionConfig, svgo: SVGOptimizer },
  Warnings,
]> {
  const warnings: Warnings = [];

  const config = new ActionConfig(core);
  if (config.isDryRun) {
    core.info("Dry mode enabled, no changes will be written");
  }

  core.info(`Using SVGO major version ${config.svgoVersion}`);
  const [svgo, svgoWarnings] = await getSvgoInstance(config);
  warnings.push(...svgoWarnings);

  return [{ config, svgo }, warnings];
}

async function run(
  client: Octokit,
  context: Context,
  config: ActionConfig,
  svgo: SVGOptimizer,
  warnings: Warnings,
): Promise<void> {
  try {
    const event = context.eventName;
    core.info(`Running SVGO Action in '${event}' context`);
    if (!SUPPORTED_EVENTS.includes(event)) {
      throw new Error(`Event '${event}' not supported`);
    }

    const optimizeData = await optimize(fs, config, svgo);
    setOutputValues(event, optimizeData);

    if (COMMENTABLE_EVENTS.includes(event) && config.enableComments) {
      const prNumber = getPrNumber(context);
      core.info(`Creating comment in Pull Request #${prNumber}...`);
      const comment = formatComment(config.comment, optimizeData, warnings);
      await createComment(client, context, prNumber, comment);
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

export default async function main(
  client: Octokit,
  context: Context,
): Promise<void> {
  const [{ config, svgo }, warnings] = await initAction();

  const skip = await shouldSkipRun(client, context);
  if (!skip.shouldSkip) {
    run(client, context, config, svgo, warnings);
  } else {
    core.info(`Action disabled from ${skip.reason}, exiting`);
  }

  logWarnings(warnings);
}
