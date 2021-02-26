export const ActionConfig = jest.fn()
  .mockImplementation(() => ({
    ignoreGlob: "",
    isDryRun: false,
    svgoOptionsPath: "svgo.config.js",
    svgoVersion: 2,
  }))
  .mockName("inputs.ActionConfig");
