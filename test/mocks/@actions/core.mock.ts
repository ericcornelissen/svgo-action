export const error = jest.fn();
export const debug = jest.fn();

export const setFailed = jest.fn();

export const getInput = jest.fn((key, _) => {
  if (key === "repo-token") {
    return "TOKEN";
  } else if (key === "configuration-path") {
    return "./config.yml";
  }
});
