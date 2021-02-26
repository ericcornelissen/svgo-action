import { actionManifest }  from "../helpers/read-manifest";


export const debug = jest.fn().mockName("core.debug");

export const error = jest.fn().mockName("core.error");

export const getInput = jest.fn()
  .mockImplementation((key, _) => {
    const inputObject = actionManifest.inputs[key];
    if (inputObject === undefined) {
      throw new Error(`unknown input ${key}`);
    }

    return inputObject.default;
  })
  .mockName("core.getInput");

export const info = jest.fn().mockName("core.info");

export const setFailed = jest.fn().mockName("core.setFailed");

export const setOutput = jest.fn().mockName("core.setOutput");

export const warning = jest.fn().mockName("core.warning");
