const getIgnoreGlob = jest.fn()
  .mockReturnValue(["", null])
  .mockName("getters.getIgnoreGlob");

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
  getIgnoreGlob,
  getIsDryRun,
  getSvgoConfigPath,
  getSvgoVersion,
};
