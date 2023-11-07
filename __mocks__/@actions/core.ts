// SPDX-License-Identifier: MIT

const defaultInputs: Record<string, string> = {
  "repo-token": "foobar",
  "dry-run": "false",
  "ignore": "",
  "svgo-config": "svgo.config.js",
  "svgo-version": "3",
};

function simulateGetInput(key: string) {
  const inputValue = defaultInputs[key]; // eslint-disable-line security/detect-object-injection
  if (inputValue === undefined) {
    throw new Error(`unknown input ${key}`);
  }

  return inputValue;
}

const debug = jest.fn()
  .mockName("core.debug");

const getBooleanInput = jest.fn()
  .mockImplementation(simulateGetInput)
  .mockName("core.getBooleanInput");

const getInput = jest.fn()
  .mockImplementation(simulateGetInput)
  .mockName("core.getInput");

const getMultilineInput = jest.fn()
  .mockImplementation((key) => [simulateGetInput(key)])
  .mockName("core.getMultilineInput");

const info = jest.fn()
  .mockName("core.info");

const setFailed = jest.fn()
  .mockName("core.setFailed");

const setOutput = jest.fn()
  .mockName("core.setOutput");

const warning = jest.fn()
  .mockName("core.warning");

export {
  debug,
  getBooleanInput,
  getInput,
  getMultilineInput,
  info,
  setFailed,
  setOutput,
  warning,
};
