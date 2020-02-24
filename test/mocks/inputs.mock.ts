export const getConfigurationPath = jest.fn()
  .mockReturnValue(".github/svgo-action.yml")
  .mockReturnValue("inputs.getConfigurationPath");

export const getDryRun = jest.fn()
  .mockReturnValue(false)
  .mockName("inputs.getDryRun");

export const getRepoToken = jest.fn()
  .mockReturnValue("TOKEN")
  .mockName("inputs.getRepoToken");
