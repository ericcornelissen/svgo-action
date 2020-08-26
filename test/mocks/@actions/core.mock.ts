import {
  INPUT_NAME_CONFIG_PATH,
  INPUT_NAME_CONVENTIONAL_COMMITS,
  INPUT_NAME_DRY_RUN,
  INPUT_NAME_REPO_TOKEN,
} from "../../../src/constants";


export const debug = jest.fn().mockName("core.debug");

export const error = jest.fn().mockName("core.error");

export const getInput = jest.fn()
  .mockImplementation((key, _) => {
    if (key === INPUT_NAME_CONFIG_PATH) {
      return "./config.yml";
    } else if (key === INPUT_NAME_CONVENTIONAL_COMMITS) {
      return "false";
    } else if (key === INPUT_NAME_DRY_RUN) {
      return "false";
    } else if (key === INPUT_NAME_REPO_TOKEN) {
      return "TOKEN";
    }
  })
  .mockName("core.getInput");

export const info = jest.fn().mockName("core.info");

export const setFailed = jest.fn().mockName("core.setFailed");

export const warning = jest.fn().mockName("core.warning");
