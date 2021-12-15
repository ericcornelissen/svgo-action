import type { SupportedSvgoVersions } from "../svgo";
import type { error, Inputter, InputterOptions, InputValue } from "./types";

import errors from "../errors";
import {
  INPUT_NAME_IGNORE,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_STRICT,
  INPUT_NAME_SVGO_CONFIG,
  INPUT_NAME_SVGO_VERSION,
  INPUT_OPTIONS_NOT_REQUIRED,
  INPUT_OPTIONS_REQUIRED,
} from "./constants";

type GetInput<T> = (name: string, options: InputterOptions) => T;

interface InputInfo<T> extends InputValue<T> {
  readonly valid: boolean;
}

interface Params<T> {
  readonly defaultValue: T;
  readonly inp: Inputter;
  readonly inputName: string;
}

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
  getInput: (inputName: string, options: { required: boolean; }) => void;
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
}: Params<T> & { getInput: GetInput<T>; }): InputInfo<T> {
  const provided = isInputProvided({ inp, inputName });
  if (!provided) {
    return { provided, valid: true, value: defaultValue };
  }

  const valid = isInputValid({ getInput, inputName });
  if (!valid) {
    return { provided, valid, value: defaultValue };
  }

  const value = getInput(inputName, INPUT_OPTIONS_NOT_REQUIRED);
  return { provided, valid, value };
}

function getBooleanInput(params: Params<boolean>): InputInfo<boolean> {
  return safeGetInput({ ...params, getInput: params.inp.getBooleanInput });
}

function getMultilineInput(params: Params<string[]>): InputInfo<string[]> {
  return safeGetInput({ ...params, getInput: params.inp.getMultilineInput });
}

function getStringInput(params: Params<string>): InputInfo<string> {
  return safeGetInput({ ...params, getInput: params.inp.getInput });
}

function getIgnoreGlobs(
  inp: Inputter,
  defaultValue: string[],
): [InputValue<string[]>, error] {
  const inputName = INPUT_NAME_IGNORE;
  const input = getMultilineInput({ inp, inputName, defaultValue });
  return [input, null];
}

function getIsDryRun(
  inp: Inputter,
  defaultValue: boolean,
): [InputValue<boolean>, error] {
  const inputName = INPUT_NAME_DRY_RUN;
  const input = getBooleanInput({ inp, inputName, defaultValue });
  if (!input.valid) {
    return [
      { ...input, value: true },
      errors.New("invalid dry-run value"),
    ];
  }

  return [input, null];
}

function getIsStrictMode(
  inp: Inputter,
  defaultValue: boolean,
): [InputValue<boolean>, error] {
  const inputName = INPUT_NAME_STRICT;
  const input = getBooleanInput({ inp, inputName, defaultValue });
  if (!input.valid) {
    return [
      { ...input, value: true },
      errors.New("invalid strict value"),
    ];
  }

  return [input, null];
}

function getSvgoConfigPath(
  inp: Inputter,
  defaultValue: string,
): [InputValue<string>, error] {
  const inputName = INPUT_NAME_SVGO_CONFIG;
  const input = getStringInput({ inp, inputName, defaultValue });
  return [input, null];
}

function getSvgoVersion(
  inp: Inputter,
  defaultValue: SupportedSvgoVersions,
): [InputValue<SupportedSvgoVersions>, error] {
  const inputName = INPUT_NAME_SVGO_VERSION;
  const input = getStringInput({ inp, inputName, defaultValue });

  const svgoVersion = input.value;
  if (svgoVersion !== "1" && svgoVersion !== "2" && svgoVersion !== "project") {
    return [
      { ...input, value: defaultValue },
      errors.New(`unsupported SVGO version '${svgoVersion}'`),
    ];
  }

  return [
    input as InputValue<SupportedSvgoVersions>,
    null,
  ];
}

export {
  getIgnoreGlobs,
  getIsDryRun,
  getIsStrictMode,
  getSvgoConfigPath,
  getSvgoVersion,
};
