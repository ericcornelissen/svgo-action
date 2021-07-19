import type { Core, GitHub } from "./types";

import * as helpers from "./helpers";

import clients from "./clients";
import configs from "./configs";
import fileSystems from "./file-systems";
import { optimizeSvgs } from "./optimize";
import { setOutputValues } from "./outputs";
import SVGO from "./svgo";

interface Params {
  readonly core: Core;
  readonly github: GitHub;
}

const strict = false;

export default async function main({
  core,
  github,
}: Params): Promise<void> {
  const [config, err0] = configs.New({ inp: core });
  if (err0 !== null) {
    core.debug(err0);
    return core.setFailed("Could not get Action configuration");
  }

  const context = github.context;
  const [event, ok0] = helpers.isEventSupported({ context });
  if (!ok0) {
    return core.setFailed(`Event not supported '${event}'`);
  }

  const [client, err1] = clients.New({ github, inp: core });
  if (err1 !== null) {
    core.debug(err1);
    return core.setFailed("Could not get GitHub client");
  }

  const baseFs = fileSystems.NewStandard();
  const [svgo, err2] = await SVGO.New({ config, fs: baseFs });
  if (err2 !== null && strict) {
    core.debug(err2);
    return core.setFailed("Could not initialize SVGO");
  }

  const [fs, err3] = await fileSystems.New({ client, context });
  if (err3 !== null) {
    core.debug(err3);
    return core.setFailed("Could not initialize file system");
  }

  core.info(`Running SVGO Action in '${event}' context`);
  core.info(`Using SVGO major version ${config.svgoVersion}`);
  if (config.isDryRun) {
    core.info("Dry mode enabled, no changes will be written");
  }

  const [optimizeData, err4] = await optimizeSvgs({ config, fs, svgo });
  if (err4 !== null) {
    core.debug(err4);
    return core.setFailed("Failed to optimize all SVGs");
  }

  // const err5 = setOutputValues(core, event, optimizeData);
  const err5 = setOutputValues({ context, data: optimizeData, out: core });
  if (err5 !== null) {
    core.debug(err5);
    return core.setFailed("Failed to set output values");
  }
}
