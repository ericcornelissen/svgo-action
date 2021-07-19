/* eslint-disable security/detect-non-literal-fs-filename */

import type { Context, Core, Warnings } from "./types";
import type { FileSystem } from "./file-system";

import { DEFAULT_SVGO_OPTIONS, SUPPORTED_EVENTS } from "./constants";
import * as fs from "./file-system";
import { ActionConfig } from "./inputs";
import { parseJavaScript, parseYaml } from "./parser";
import { SVGOptimizer, SVGOptions } from "./svgo";
import { optimize } from "./optimize";
import { setOutputValues } from "./outputs";

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

async function initAction(core: Core): Promise<[
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
  core: Core,
  context: Context,
  config: ActionConfig,
  svgo: SVGOptimizer,
  fs: FileSystem,
): Promise<void> {
  try {
    const event = context.eventName;
    core.info(`Running SVGO Action in '${event}' context`);
    if (!SUPPORTED_EVENTS.includes(event)) {
      throw new Error(`Event '${event}' not supported`);
    }

    const optimizeData = await optimize(fs, config, svgo);
    setOutputValues(core, event, optimizeData);
  } catch (error) {
    core.setFailed(`action failed with error '${error}'`);
  }
}

export default async function main(
  core: Core,
  context: Context,
): Promise<void> {
  const [{ config, svgo }, warnings] = await initAction(core);
  run(core, context, config, svgo, fs);
  warnings.forEach((warning) => core.warning(warning));
}
