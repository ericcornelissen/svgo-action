const defaultInputs = {
  "repo-token": "foobar",
  "dry-run": false,
  "ignore": "",
  "svgo-config": "svgo.config.js",
  "svgo-version": 2,
};

function simulateGetInput(key: string) {
  const inputObject = defaultInputs[key]; // eslint-disable-line security/detect-object-injection
  if (inputObject === undefined) {
    throw new Error(`unknown input ${key}`);
  }

  return inputObject.default;
}

const debug = jest.fn()
  .mockName("core.debug");

const getBooleanInput = jest.fn()
  .mockImplementation(simulateGetInput)
  .mockName("core.getInput");

const getInput = jest.fn()
  .mockImplementation(simulateGetInput)
  .mockName("core.getInput");

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
  info,
  setFailed,
  setOutput,
  warning,
};
