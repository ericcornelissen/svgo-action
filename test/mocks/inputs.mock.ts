export const ActionConfig = jest.fn()
  .mockImplementation(() => ({
    ignoreGlob: "",
    isDryRun: false,
    svgoOptionsPath: "404",
    svgoVersion: 2,
  }))
  .mockName("inputs.ActionConfig");
