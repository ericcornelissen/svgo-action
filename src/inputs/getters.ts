import type { error, Inputter, InputterOptions } from "../types";
import type { SupportedSvgoVersions } from "../svgo";

import {
  INPUT_NAME_IGNORE,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_SVGO_CONFIG,
  INPUT_NAME_SVGO_VERSION,
} from "../constants";
import errors from "../errors";

interface InputValue<T> {
  readonly value: T;
  readonly valid: boolean;
}

interface Params<T> {
  readonly inp: Inputter;
  readonly inputName: string;
  readonly defaultValue: T;
}

type GetInput<T> = (name: string, options: InputterOptions) => T;

const INPUT_OPTIONS_REQUIRED = { required: true };
const INPUT_OPTIONS_NOT_REQUIRED = { required: false };

function isInputProvided({
  inp,
  inputName,
}: {
  inp: Inputter;
  inputName: string;
}): boolean {
  try {
    inp.getInput(inputName, INPUT_OPTIONS_REQUIRED);
  } catch (_) {
    return false;
  }

  return true;
}

function isInputValid({
  getInput,
  inputName,
}: {
  getInput: (inputName: string, options: { required: boolean }) => void;
  inputName: string;
}): boolean {
  let valid = true;
  try {
    getInput(inputName, INPUT_OPTIONS_NOT_REQUIRED);
  } catch(_) {
    valid = false;
  }

  return valid;
}

function safeGetInput<T>({
  inp,
  inputName,
  getInput,
  defaultValue,
}: Params<T> & { getInput: GetInput<T> }): InputValue<T> {
  const provided = isInputProvided({ inp, inputName });
  if (!provided) {
    return { valid: true, value: defaultValue };
  }

  const valid = isInputValid({ getInput, inputName });
  if (!valid) {
    return { valid, value: defaultValue };
  }

  const value = getInput(inputName, INPUT_OPTIONS_NOT_REQUIRED);
  return { valid, value };
}

function getBooleanInput(params: Params<boolean>): InputValue<boolean> {
  return safeGetInput({ ...params, getInput: params.inp.getBooleanInput });
}

function getMultilineInput(params: Params<string[]>): InputValue<string[]> {
  return safeGetInput({ ...params, getInput: params.inp.getMultilineInput });
}

function getNumericInput(params: Params<number>): InputValue<number> {
  return safeGetInput({
    ...params,
    getInput: (inputName: string, options: InputterOptions) => {
      const resultStr = params.inp.getInput(inputName, options);
      const result = parseInt(resultStr, 10);
      if (isNaN(result)) throw new TypeError();
      return result;
    },
  });
}

function getStringInput(params: Params<string>): InputValue<string> {
  return safeGetInput({ ...params, getInput: params.inp.getInput });
}

function getIgnoreGlobs(
  inp: Inputter,
  defaultValue: string[],
): [string[], error] {
  const inputName = INPUT_NAME_IGNORE;
  const input = getMultilineInput({ inp, inputName, defaultValue });
  return [input.value, null];
}

function getIsDryRun(
  inp: Inputter,
  defaultValue: boolean,
): [boolean, error] {
  const inputName = INPUT_NAME_DRY_RUN;
  const input = getBooleanInput({ inp, inputName, defaultValue });
  if (!input.valid) {
    return [true, errors.New("invalid dry-run value")];
  }

  return [input.value, null];
}

function getSvgoConfigPath(
  inp: Inputter,
  defaultValue: string,
): [string, error] {
  const inputName = INPUT_NAME_SVGO_CONFIG;
  const input = getStringInput({ inp, inputName, defaultValue });
  return [input.value, null];
}

function getSvgoVersion(
  inp: Inputter,
  defaultValue: SupportedSvgoVersions,
): [SupportedSvgoVersions, error] {
  const inputName = INPUT_NAME_SVGO_VERSION;
  const input = getNumericInput({ inp, inputName, defaultValue });
  if (!input.valid) {
    return [defaultValue, errors.New("invalid SVGO version value")];
  }

  const svgoVersion = input.value;
  if (svgoVersion !== 1 && svgoVersion !== 2) {
    return [
      defaultValue,
      errors.New(`unsupported SVGO version '${svgoVersion}'`),
    ];
  }

  return [svgoVersion, null];
}

export {
  getIgnoreGlobs,
  getIsDryRun,
  getSvgoConfigPath,
  getSvgoVersion,
};
