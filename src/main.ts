import type { error, Core, GitHub } from "./types";

import * as helpers from "./helpers";

import clients from "./clients";
import configs from "./configs";
import fileSystems from "./file-systems";
import { optimizeSvgs } from "./optimize";
import { setOutputValues } from "./outputs";
import parsers from "./parsers";
import SVGO from "./svgo";

interface Params {
  readonly core: Core;
  readonly github: GitHub;
}

function parseRawConfig({ rawConfig, svgoVersion }: {
  rawConfig: string,
  svgoVersion: number,
}): [unknown, error] {
  if (svgoVersion === 1) {
    const parseYaml = parsers.NewYaml();
    return parseYaml(rawConfig);
  } else {
    const parseJavaScript = parsers.NewJavaScript();
    return parseJavaScript(rawConfig);
  }
}

export default async function main({
  core,
  github,
}: Params): Promise<void> {
  const [config, err0] = configs.New({ inp: core });
  if (err0 !== null) {
    core.warning(`Your SVGO Action configuration is incorrect: ${err0}`);
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

  const { svgoOptionsPath, svgoVersion } = config;

  const baseFs = fileSystems.NewStandard();
  const [rawConfig, err1dot1] = await baseFs.readFile(svgoOptionsPath); // eslint-disable-line security/detect-non-literal-fs-filename
  if (err1dot1 !== null) {
    core.warning("SVGO configuration file not found");
  }

  const [svgoOptions, err1dot2] = parseRawConfig({ rawConfig, svgoVersion });
  if (err1dot2 !== null && err1dot1 === null) {
    return core.setFailed("Could not parse SVGO configuration");
  }

  const [svgo, err2] = SVGO.New({ config, svgoOptions });
  if (err2 !== null) {
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
