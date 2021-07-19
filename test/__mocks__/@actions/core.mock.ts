import { Core } from "../../../src/types";

import { actionManifest }  from "../helpers/read-manifest";

type CoreMock = jest.Mocked<Core>;

function getInput(key, _) {
  const inputObject = actionManifest.inputs[key];
  if (inputObject === undefined) {
    throw new Error(`unknown input ${key}`);
  }

  return inputObject.default;
}

function createCoreMock(): CoreMock {
  return {
    debug: jest.fn()
      .mockName("core.debug"),
    getBooleanInput: jest.fn()
      .mockImplementation(getInput)
      .mockName("core.getInput"),
    getInput: jest.fn()
      .mockImplementation(getInput)
      .mockName("core.getInput"),
    info: jest.fn()
      .mockName("core.info"),
    setFailed: jest.fn()
      .mockName("core.setFailed"),
    setOutput: jest.fn()
      .mockName("core.setOutput"),
    warning: jest.fn()
      .mockName("core.warning"),
  };
}

export {
  createCoreMock,
};
