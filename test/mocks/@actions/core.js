module.exports = {
  error: jest.fn(),
  debug: jest.fn(),

  getInput: jest.fn((key, _) => {
    if (key === "repo-token") {
      return "TOKEN";
    } else if (key === "configuration-path") {
      return "./config.yml";
    }
  })
};
