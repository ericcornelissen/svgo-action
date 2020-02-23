let dryRun = "false";


export const setDryRun = (newValue: string): void => { dryRun = newValue; };


export const debug = jest.fn().mockName("core.debug");
export const error = jest.fn().mockName("core.error");
export const info = jest.fn().mockName("core.info");

export const setFailed = jest.fn().mockName("core.setFailed");

export const getInput = jest.fn()
  .mockImplementation((key, _) => {
    if (key === "repo-token") {
      return "TOKEN";
    } else if (key === "configuration-path") {
      return "./config.yml";
    } else if (key === "dry-run") {
      return dryRun;
    }
  })
  .mockName("core.getInput");
