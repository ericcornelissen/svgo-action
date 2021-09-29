import type { Core, GitHub } from "./types";

import actionManagement from "./action-management";
import clients from "./clients";
import fileSystems from "./file-systems";
import inputs from "./inputs";
import optimize from "./optimize";
import outputs from "./outputs";
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

async function main({ core, github }: Params): Promise<void> {
  const [config, err0] = inputs.New({ inp: core });
  const action = actionManagement.New({ core, config });
  action.strictFailIf(err0, `Invalid SVGO Action configuration: ${err0}`);

  if (config.isDryRun.value) {
    core.info("Dry mode enabled, no changes will be written");
  }

  const [event, ok0] = isEventSupported(github);
  core.info(`Running SVGO Action in '${event}' context`);
  action.failIf(!ok0, `Event not supported '${event}'`);

  const [client, err1] = clients.New({ github, inp: core });
  action.failIf(err1 && isClientRequired(event), "Could not get GitHub client");

  const configFs = fileSystems.New({ filters: [] });
  const [rawConfig, err2] = await configFs.readFile({ // eslint-disable-line security/detect-non-literal-fs-filename
    path: config.svgoConfigPath.value,
  });
  action.strictFailIf(
    err2 !== null && config.svgoConfigPath.provided,
    "SVGO configuration file not found",
  );

  const [svgoConfig, err3] = parseRawSvgoConfig({ config, rawConfig });
  action.failIf(
    err3 !== null && err2 === null,
    "Could not parse SVGO configuration",
  );

  const [optimizer, err4] = svgo.New({ config, svgoConfig });
  core.info(`Using SVGO major version ${config.svgoVersion.value}`);
  action.failIf(err4, "Could not initialize SVGO");

  const [filters, err5] = await getFilters({ client, config, github });
  action.failIf(err5, "Could not initialize file filters");

  const fs = fileSystems.New({ filters });
  const [optimizeData, err6] = await optimize.Files({ config, fs, optimizer });
  action.failIf(err6, "Failed to optimize SVGs");

  const err7 = outputs.Set({ env: github, data: optimizeData, out: core });
  action.failIf(err7, "Failed to set output values");
}

export default main;
