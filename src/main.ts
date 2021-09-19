import type { Core, GitHub } from "./types";

import clients from "./clients";
import fileSystems from "./file-systems";
import inputs from "./inputs";
import optimize from "./optimize";
import { setOutputValues } from "./outputs";
import svgo from "./svgo";

import {
  getFilters,
  isClientRequired,
  isEventSupported,
  parseRawSvgoConfig,
} from "./helpers";

interface Params {
  readonly core: Core;
  readonly github: GitHub;
}

async function main({
  core,
  github,
}: Params): Promise<void> {
  const [config, err0] = inputs.New({ inp: core });
  if (err0 !== null) {
    core.warning(`Your SVGO Action configuration is incorrect: ${err0}`);
  }

  const context = github.context;
  const [event, ok0] = isEventSupported({ context });
  if (!ok0) {
    return core.setFailed(`Event not supported '${event}'`);
  }

  const [client, err1] = clients.New({ github, inp: core });
  if (err1 !== null && isClientRequired(event)) {
    core.debug(err1);
    return core.setFailed("Could not get GitHub client");
  }

  const configFs = fileSystems.New({ filters: [] });
  const [rawConfig, err2] = await configFs.readFile({ // eslint-disable-line security/detect-non-literal-fs-filename
    path: config.svgoConfigPath.value,
  });
  if (err2 !== null && config.svgoConfigPath.provided) {
    core.warning("SVGO configuration file not found");
  }

  const [svgoConfig, err3] = parseRawSvgoConfig({ config, rawConfig });
  if (err3 !== null && err2 === null) {
    return core.setFailed("Could not parse SVGO configuration");
  }

  const [optimizer, err4] = svgo.New({ config, svgoConfig });
  if (err4 !== null) {
    core.debug(err4);
    return core.setFailed("Could not initialize SVGO");
  }

  const [filters, err5] = await getFilters({ client, config, github });
  if (err5 !== null) {
    core.debug(err5);
    return core.setFailed("Could not initialize filters");
  }

  const fs = fileSystems.New({ filters });

  core.info(`Running SVGO Action in '${event}' context`);
  core.info(`Using SVGO major version ${config.svgoVersion.value}`);
  if (config.isDryRun.value) {
    core.info("Dry mode enabled, no changes will be written");
  }

  const [optimizeData, err6] = await optimize.Files({ config, fs, optimizer });
  if (err6 !== null) {
    core.debug(err6);
    return core.setFailed("Failed to optimize all SVGs");
  }

  const err7 = setOutputValues({ context, data: optimizeData, out: core });
  if (err7 !== null) {
    core.debug(err7);
    return core.setFailed("Failed to set output values");
  }
}

export default main;
