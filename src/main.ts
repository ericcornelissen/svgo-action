import type { error, Core, GitHub } from "./types";
import type { GitHubClient } from "./clients";

import * as helpers from "./helpers";

import clients from "./clients";
import configs from "./configs";
import { EVENT_PULL_REQUEST, EVENT_PUSH } from "./constants";
import fileSystems from "./file-systems";
import filters from "./filters";
import optimize from "./optimize";
import { setOutputValues } from "./outputs";
import parsers from "./parsers";
import svgo from "./svgo";

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

async function getFilters({ client, event, github }: {
  client: GitHubClient,
  event: string,
  github: GitHub,
}): Promise<[((s: string) => boolean)[], error]> {
  const { context } = github;

  const result = [filters.NewSvgsFilter()];
  let err: error = null;
  if (event === EVENT_PULL_REQUEST) {
    const [f, err0] = await filters.NewPrFilesFilter({ client, context });
    result.push(f);
    err = err0;
  } else if (event === EVENT_PUSH) {
    const [f, err1] = await filters.NewPushedFilesFilter({ client, context });
    result.push(f);
    err = err1;
  }

  return [result, err];
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

  const { svgoConfigPath, svgoVersion } = config;

  const [rawConfig, err1dot1] = await fileSystems.New().readFile({ // eslint-disable-line security/detect-non-literal-fs-filename
    path: svgoConfigPath,
  });
  if (err1dot1 !== null) {
    core.warning("SVGO configuration file not found");
  }

  const [svgoConfig, err1dot2] = parseRawConfig({ rawConfig, svgoVersion });
  if (err1dot2 !== null && err1dot1 === null) {
    return core.setFailed("Could not parse SVGO configuration");
  }

  const [optimizer, err2] = svgo.New({ config, svgoConfig });
  if (err2 !== null) {
    core.debug(err2);
    return core.setFailed("Could not initialize SVGO");
  }

  const [filters, err21] = await getFilters({ event, client, github });
  if (err21 !== null) {
    core.debug(err21);
    return core.setFailed("Could not initialize filters");
  }

  const [fs, err3] = fileSystems.NewFiltered({ filters });
  if (err3 !== null) {
    core.debug(err3);
    return core.setFailed("Could not initialize file system");
  }

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

  // const err5 = setOutputValues(core, event, optimizeData);
  const err5 = setOutputValues({ context, data: optimizeData, out: core });
  if (err5 !== null) {
    core.debug(err5);
    return core.setFailed("Failed to set output values");
  }
}
