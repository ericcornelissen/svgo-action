// SPDX-License-Identifier: MIT

import type { Core, GitHub } from "./types";

import actionManagement from "./action-management";
import clients from "./clients";
import fileSystems from "./file-systems";
import {
  deprecationWarnings,
  getFilters,
  isClientRequired,
  isEventSupported,
  parseRawSvgoConfig,
} from "./helpers";
import inputs from "./inputs";
import optimize from "./optimize";
import outputs from "./outputs";
import svgo from "./svgo";

interface Params {
  readonly core: Core;
  readonly github: GitHub;
}

async function main({ core, github }: Params): Promise<void> {
  deprecationWarnings({ core });

  core.debug("Getting input");
  const [config, err0] = inputs.New({ inp: core });

  core.debug("Initializing ActionManagement");
  const action = actionManagement.New({ core, config });
  action.strictFailIf(err0, `Invalid SVGO Action configuration: ${err0}`);

  core.debug("Checking if dry-run is enabled");
  if (config.isDryRun.value) {
    core.info("Dry mode enabled, no changes will be written");
  }

  core.debug("Checking if the event is supported");
  const [event, ok0] = isEventSupported(github);
  core.info(`Running SVGO Action in '${event}' context`);
  action.strictFailIf(!ok0, `Event not supported '${event}'`);

  core.debug("Initializing GitHub client");
  const [client, err1] = clients.New({ github, inp: core });
  action.failIf(err1 && isClientRequired(event), "Could not get GitHub client");

  core.debug("Initializing FileSystem to read SVGO config");
  const configFs = fileSystems.New({ filters: [] });
  core.debug(`Reading the SVGO config file at ${config.svgoConfigPath.value}`);
  const [rawConfig, err2] = await configFs.readFile({
    path: config.svgoConfigPath.value,
  });
  action.strictFailIf(
    err2 !== null && config.svgoConfigPath.provided,
    "SVGO configuration file not found",
  );

  core.debug("Parsing SVGO configuration");
  const [svgoConfig, err3] = parseRawSvgoConfig({ config, rawConfig });
  action.strictFailIf(
    err3 !== null && err2 === null,
    "Could not parse SVGO configuration",
  );

  core.debug("Initializing SVGO");
  const [optimizer, err4] = svgo.New({ config, svgoConfig });
  action.failIf(err4, "Could not initialize SVGO");

  core.debug("Initializing optimization filters");
  const [filters, err5] = await getFilters({ client, config, github });
  action.failIf(err5, "Could not initialize file filters");

  core.debug("Initializing FileSystem to read SVGs");
  const fs = fileSystems.New({ filters });

  core.debug("Optimizing SVGs");
  const [optimizeData, err6] = await optimize.Files({ config, fs, optimizer });
  action.failIf(err6, "Failed to optimize SVGs");

  core.debug("Setting outputs");
  const err7 = outputs.Set({ env: github, data: optimizeData, out: core });
  action.failIf(err7, "Failed to set output values");
}

export default main;
