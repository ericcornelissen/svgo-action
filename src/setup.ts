import type { error } from "./types";

import * as path from "path";

import * as core from "@actions/core";
import * as exec from "@actions/exec";
import * as io from "@actions/io";

import errors from "./errors";
import inputs from "./inputs";

const versionExpr = /^v?[0-9]+\.[0-9]+\.[0-9]+$/;

const NPM_INSTALL_FLAGS = [
  "--no-save",
];

function getInstallPath(
  env: Record<string, string | undefined>,
): [string, error] {
  const tempDir = env.RUNNER_TEMP;
  if (!tempDir) {
    return [
      "",
      errors.New("RUNNER_TEMP missing from environment"),
    ];
  }

  const installPath = path.resolve(tempDir, "svgo-action");
  return [installPath, null];
}

function getSvgoVersionToInstall({ config }: {
  readonly config: {
    readonly svgoVersion: {
      readonly provided: boolean;
      readonly value: string;
    };
  };
}): [string, boolean] {
  if (!config.svgoVersion.provided) {
    return ["", false];
  }

  const svgoVersion = config.svgoVersion.value;
  if (!versionExpr.test(svgoVersion)) {
    return ["", false];
  }

  return [svgoVersion, true];
}

async function main(): Promise<void> {
  const [installPath, err0] = getInstallPath(process.env);
  if (err0) {
    core.setFailed(err0);
  }

  core.saveState("NODE_MODULES", installPath);

  const [config, err1] = inputs.New({ inp: core });
  if (err1) {
    return;
  }

  const [version, ok0] = getSvgoVersionToInstall({ config });
  if (ok0) {
    await io.mkdirP(installPath);
    await exec.exec(
      "npm install",
      [...NPM_INSTALL_FLAGS, `svgo@${version}`],
      { cwd: installPath },
    );
  } else {
    core.info("Nothing to do here");
  }
}

main();
