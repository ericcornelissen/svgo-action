import type { error, Inputter } from "../types";
import type { SupportedSvgoVersions } from "../svgo";

import {
  INPUT_NAME_IGNORE,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_SVGO_CONFIG,
  INPUT_NAME_SVGO_VERSION,
} from "../constants";
import errors from "../errors";

const INPUT_NOT_REQUIRED = { required: false };

interface Params<T> {
  readonly inp: Inputter;
  readonly inputName: string;
  readonly defaultValue: T;
}

function safeGetInput({
  inp,
  inputName,
  defaultValue,
}: Params<string>): [string, error] {
  let result = defaultValue;
  let err: error = null;

  try {
    result = inp.getInput(inputName, INPUT_NOT_REQUIRED);
  } catch (_) {
    err = errors.New(`could not get input '${inputName}'`);
  }

  return [result, err];
}

function safeGetBooleanInput({
  inp,
  inputName,
  defaultValue,
}: Params<boolean>): [boolean, error] {
  let result = defaultValue;
  let err: error = null;

  try {
    result = inp.getBooleanInput(inputName, INPUT_NOT_REQUIRED);
  } catch (_) {
    err = errors.New(`could not get input '${inputName}'`);
  }

  return [result, err];
}

function safeGetNumericInput({
  inp,
  inputName,
  defaultValue,
}: Params<number>): [number, error] {
  let result = defaultValue;
  let err: error = null;

  try {
    const _result = inp.getInput(inputName, INPUT_NOT_REQUIRED);
    result = parseInt(_result, 10);
  } catch (_) {
    err = errors.New(`could not get input '${inputName}'`);
  }

  return [result, err];
}

function getIgnoreGlob(
  inp: Inputter,
  defaultValue: string,
): [string, error] {
  const inputName = INPUT_NAME_IGNORE;
  return safeGetInput({ inp, inputName, defaultValue });
}

function getIsDryRun(
  inp: Inputter,
  defaultValue: boolean,
): [boolean, error] {
  const inputName = INPUT_NAME_DRY_RUN;
  return safeGetBooleanInput({ inp, inputName, defaultValue });
}

function getSvgoConfigPath(
  inp: Inputter,
  defaultValue: string,
): [string, error] {
  const inputName = INPUT_NAME_SVGO_CONFIG;
  return safeGetInput({ inp, inputName, defaultValue });
}

function getSvgoVersion(
  inp: Inputter,
  defaultValue: SupportedSvgoVersions,
): [SupportedSvgoVersions, error] {
  const inputName = INPUT_NAME_SVGO_VERSION;

  const [svgoVersion, err] = safeGetNumericInput({
    inp,
    inputName,
    defaultValue,
  });
  if (err !== null) {
    return [defaultValue, err];
  }

  if (svgoVersion !== 1 && svgoVersion !== 2) {
    return [
      defaultValue,
      errors.New(`invalid SVGO version '${svgoVersion}'`),
    ];
  }

  return [svgoVersion, null];
}

export {
  getIgnoreGlob,
  getIsDryRun,
  getSvgoConfigPath,
  getSvgoVersion,
};
