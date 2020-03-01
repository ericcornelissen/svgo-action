export const ActionConfigInstance = {
  isDryRun: jest.fn()
    .mockReturnValue(false)
    .mockName("ActionConfig.isDryRun"),
};

export const ActionConfig = jest.fn()
  .mockReturnValue(ActionConfigInstance)
  .mockName("inputs.ActionConfig");

export const getConfigFilePath = jest.fn()
  .mockReturnValue(".github/svgo-action.yml")
  .mockReturnValue("inputs.getConfigFilePath");

export const getRepoToken = jest.fn()
  .mockReturnValue("TOKEN")
  .mockName("inputs.getRepoToken");
