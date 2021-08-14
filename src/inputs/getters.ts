import type { error, Inputter } from "../types";
import type { SupportedSvgoVersions } from "../svgo";

import {
  INPUT_NAME_IGNORE,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_SVGO_CONFIG,
  INPUT_NAME_SVGO_VERSION,
} from "../constants";
import errors from "../errors";

const GET_INPUT_OPTIONS = { required: true };

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
  let result;

  try {
    result = inp.getInput(inputName, GET_INPUT_OPTIONS);
  } catch (_) {
    result = defaultValue;
  }

  return [result, null];
}

function safeGetBooleanInput({
  inp,
  inputName,
  defaultValue,
}: Params<boolean>): [boolean, error] {
  let result;

  try {
    result = inp.getBooleanInput(inputName, GET_INPUT_OPTIONS);
  } catch (_) {
    result = defaultValue;
  }

  return [result, null];
}

function safeGetNumericInput({
  inp,
  inputName,
  defaultValue,
}: Params<number>): [number, error] {
  let result;

  try {
    const _result = inp.getInput(inputName, GET_INPUT_OPTIONS);
    result = parseInt(_result, 10);
  } catch (_) {
    result = defaultValue;
  }

  return [result, null];
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

  if (svgoVersion !== 1 && svgoVersion !== 2) {
    return [
      defaultValue,
      errors.New(`invalid SVGO version '${svgoVersion}'`),
    ];
  }

  return [svgoVersion, err];
}

export {
  getIgnoreGlob,
  getIsDryRun,
  getSvgoConfigPath,
  getSvgoVersion,
};
