export const error = jest.fn().mockName("core.error");
export const debug = jest.fn().mockName("core.debug");
export const setFailed = jest.fn().mockName("core.setFailed");

export const getInput = jest.fn()
  .mockImplementation((key, _) => {
    if (key === "repo-token") {
      return "TOKEN";
    } else if (key === "configuration-path") {
      return "./config.yml";
    }
  })
  .mockName("core.getInput");
