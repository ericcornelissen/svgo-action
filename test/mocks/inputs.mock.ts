export const ActionConfig = jest.fn()
  .mockReturnValue({
    svgoOptionsPath: ".svgo.yml",
    isDryRun: false,
  })
  .mockName("inputs.ActionConfig");

export const getConfigFilePath = jest.fn()
  .mockReturnValue(".github/svgo-action.yml")
  .mockReturnValue("inputs.getConfigFilePath");

export const getRepoToken = jest.fn()
  .mockReturnValue("TOKEN")
  .mockName("inputs.getRepoToken");
