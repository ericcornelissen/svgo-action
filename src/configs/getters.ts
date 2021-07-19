import type { error, Inputter } from "../types";
import type { AllowedSvgoVersions } from "../svgo";

import { INPUT_NAMES } from "../constants";
import errors from "../errors";

const INPUT_NOT_REQUIRED = { required: false };

function safeGetInput(
  inp: Inputter,
  inputName: string,
): [string, error] {
  let result = "";
  let err: error = null;

  try {
    result = inp.getInput(inputName, INPUT_NOT_REQUIRED);
  } catch (_) {
    err = errors.New(`could not get input '${inputName}'`);
  }

  return [result, err];
}

function safeGetBooleanInput(
  inp: Inputter,
  inputName: string,
): [boolean, error] {
  let result = false;
  let err: error = null;

  try {
    result = inp.getBooleanInput(inputName, INPUT_NOT_REQUIRED);
  } catch (_) {
    err = errors.New(`could not get input '${inputName}'`);
  }

  return [result, err];
}

function getIgnoreGlob(inp: Inputter): [string, error] {
  const erroredValue = "";

  const [ignoreGlob, err] = safeGetInput(inp, INPUT_NAMES.ignore);
  return [err === null ? ignoreGlob : erroredValue, err];
}

function getIsDryRun(inp: Inputter): [boolean, error] {
  const erroredValue = true;

  const [isDryRun, err] = safeGetBooleanInput(inp, INPUT_NAMES.dryRun);
  return [err === null ? isDryRun : erroredValue, err];
}

function getSvgoOptionsPath(inp: Inputter): [string, error] {
  const erroredValue = "svgo.config.js";

  const [svgoOptionsPath, err] = safeGetInput(inp, INPUT_NAMES.svgoOptions);
  return [err === null ? svgoOptionsPath : erroredValue, err];
}

function getSvgoVersion(inp: Inputter): [AllowedSvgoVersions, error] {
  const erroredValue = 2;

  const [rawSvgoVersion, err0] = safeGetInput(inp, INPUT_NAMES.svgoVersion);
  if (err0 !== null) {
    return [erroredValue, err0];
  }

  const svgoVersion = parseInt(rawSvgoVersion, 10);
  if (svgoVersion !== 1 && svgoVersion !== 2) {
    const err1 = errors.New(`invalid SVGO version '${svgoVersion}'`);
    return [erroredValue, err1];
  }

  return [svgoVersion, null];
}

export {
  getIgnoreGlob,
  getIsDryRun,
  getSvgoOptionsPath,
  getSvgoVersion,
};
