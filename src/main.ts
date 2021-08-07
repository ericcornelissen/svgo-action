import type { Core, GitHub } from "./types";

import clients from "./clients";
import fileSystems from "./file-systems";
import inputs from "./inputs";
import optimize from "./optimize";
import { setOutputValues } from "./outputs";
import svgo from "./svgo";

import { EVENTS } from "./constants";
import {
  getFilters,
  isEventSupported,
  parseRawSvgoConfig,
} from "./helpers";

interface Params {
  readonly core: Core;
  readonly github: GitHub;
}

const CLIENT_REQUIRED_EVENTS = [
  EVENTS.pullRequest,
  EVENTS.push,
];

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
  if (err1 !== null && CLIENT_REQUIRED_EVENTS.includes(event)) {
    core.debug(err1);
    return core.setFailed("Could not get GitHub client");
  }

  const { svgoConfigPath, svgoVersion } = config;

  const configFs = fileSystems.New({ filters: [] });
  const [rawConfig, err1dot1] = await configFs.readFile({ // eslint-disable-line security/detect-non-literal-fs-filename
    path: svgoConfigPath,
  });
  if (err1dot1 !== null) {
    core.warning("SVGO configuration file not found");
  }

  const [svgoConfig, err1dot2] = parseRawSvgoConfig({ rawConfig, svgoVersion });
  if (err1dot2 !== null && err1dot1 === null) {
    return core.setFailed("Could not parse SVGO configuration");
  }

  const [optimizer, err2] = svgo.New({ config, svgoConfig });
  if (err2 !== null) {
    core.debug(err2);
    return core.setFailed("Could not initialize SVGO");
  }

  const [filters, err21] = await getFilters({ event, client, config, github });
  if (err21 !== null) {
    core.debug(err21);
    return core.setFailed("Could not initialize filters");
  }

  const fs = fileSystems.New({ filters });

  core.info(`Running SVGO Action in '${event}' context`);
  core.info(`Using SVGO major version ${config.svgoVersion}`);
  if (config.isDryRun) {
    core.info("Dry mode enabled, no changes will be written");
  }

  const [optimizeData, err4] = await optimize.Files({ config, fs, optimizer });
  if (err4 !== null) {
    core.debug(err4);
    return core.setFailed("Failed to optimize all SVGs");
  }

  const err5 = setOutputValues({ context, data: optimizeData, out: core });
  if (err5 !== null) {
    core.debug(err5);
    return core.setFailed("Failed to set output values");
  }
}

export default main;
