const getIgnoreGlobs = jest.fn()
  .mockReturnValue(["", null])
  .mockName("getters.getIgnoreGlobs");

const getIsDryRun = jest.fn()
  .mockReturnValue([false, null])
  .mockName("getters.getIsDryRun");

const getSvgoConfigPath = jest.fn()
  .mockReturnValue(["", null])
  .mockName("getters.getSvgoConfigPath");

const getSvgoVersion = jest.fn()
  .mockReturnValue([2, null])
  .mockName("getters.getSvgoVersion");

export {
  getIgnoreGlobs,
  getIsDryRun,
  getSvgoConfigPath,
  getSvgoVersion,
};
