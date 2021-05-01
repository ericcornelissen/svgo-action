/* eslint-disable security/detect-non-literal-fs-filename */

import type { Context, RawActionConfig, Warnings } from "./types";

import * as core from "@actions/core";

import {
  DEFAULT_CONFIG_PATH,
  DEFAULT_SVGO_OPTIONS,
  INPUT_NAME_CONFIG_PATH,
  INPUT_NOT_REQUIRED,
  SUPPORTED_EVENTS,
} from "./constants";
import * as fs from "./file-system";
import { ActionConfig } from "./inputs";
import { parseJavaScript, parseYaml } from "./parser";
import { SVGOptimizer, SVGOptions } from "./svgo";
import { optimize } from "./optimize";
import { setOutputValues } from "./outputs";

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

async function initAction(): Promise<[
  { config: ActionConfig, svgo: SVGOptimizer },
  Warnings,
]> {
  const warnings: Warnings = [];

  const [config, configWarnings] = await getActionConfig();
  warnings.push(...configWarnings);
  if (config.isDryRun) {
    core.info("Dry mode enabled, no changes will be written");
  }

  core.info(`Using SVGO major version ${config.svgoVersion}`);
  const [svgo, svgoWarnings] = await getSvgoInstance(config);
  warnings.push(...svgoWarnings);

  return [{ config, svgo }, warnings];
}

async function run(
  context: Context,
  config: ActionConfig,
  svgo: SVGOptimizer,
): Promise<void> {
  try {
    const event = context.eventName;
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

function logWarnings(warnings: Warnings): void {
  for (const warning of warnings) {
    core.warning(warning);
  }
}

export default async function main(
  context: Context,
): Promise<void> {
  const [{ config, svgo }, warnings] = await initAction();
  run(context, config, svgo);
  logWarnings(warnings);
}
