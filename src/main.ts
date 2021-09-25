import type { Core, GitHub } from "./types";

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

interface ActionManagement {
  fail(msg: string): void;
  strictFail(msg: string): void;
}

function createActionManagement(
  core: Core,
  strict: boolean,
): ActionManagement {
  return {
    fail: core.setFailed,
    strictFail: strict ? core.setFailed : core.warning,
  };
}

async function main({
  core,
  github,
}: Params): Promise<void> {
  const [config, err0] = inputs.New({ inp: core });

  const action = createActionManagement(core, config.isStrictMode.value);
  if (err0 !== null) {
    action.strictFail(`Your SVGO Action configuration is incorrect: ${err0}`);
  }

  const context = github.context;
  const [event, ok0] = isEventSupported({ context });
  if (!ok0) {
    action.fail(`Event not supported '${event}'`);
  }

  const [client, err1] = clients.New({ github, inp: core });
  if (err1 !== null && isClientRequired(event)) {
    core.debug(err1);
    action.fail("Could not get GitHub client");
  }

  const configFs = fileSystems.New({ filters: [] });
  const [rawConfig, err2] = await configFs.readFile({ // eslint-disable-line security/detect-non-literal-fs-filename
    path: config.svgoConfigPath.value,
  });
  if (err2 !== null && config.svgoConfigPath.provided) {
    action.strictFail("SVGO configuration file not found");
  }

  const [svgoConfig, err3] = parseRawSvgoConfig({ config, rawConfig });
  if (err3 !== null && err2 === null) {
    action.fail("Could not parse SVGO configuration");
  }

  const [optimizer, err4] = svgo.New({ config, svgoConfig });
  if (err4 !== null) {
    core.debug(err4);
    action.fail("Could not initialize SVGO");
  }

  const [filters, err5] = await getFilters({ client, config, github });
  if (err5 !== null) {
    core.debug(err5);
    action.fail("Could not initialize filters");
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
    action.fail("Failed to optimize all SVGs");
  }

  const err7 = outputs.Set({ context, data: optimizeData, out: core });
  if (err7 !== null) {
    core.debug(err7);
    action.fail("Failed to set output values");
  }
}

export default main;
