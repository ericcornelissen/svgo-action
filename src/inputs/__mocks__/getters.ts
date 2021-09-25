import { defaultConfig } from "./__common__";

const getIgnoreGlobs = jest.fn()
  .mockReturnValue([defaultConfig.ignoreGlobs, null])
  .mockName("getters.getIgnoreGlobs");

const getIsDryRun = jest.fn()
  .mockReturnValue([defaultConfig.isDryRun, null])
  .mockName("getters.getIsDryRun");

const getIsStrictMode = jest.fn()
  .mockReturnValue([defaultConfig.isStrictMode, null])
  .mockName("getters.getIsStrictMode");

const getSvgoConfigPath = jest.fn()
  .mockReturnValue([defaultConfig.svgoConfigPath, null])
  .mockName("getters.getSvgoConfigPath");

const getSvgoVersion = jest.fn()
  .mockReturnValue([defaultConfig.svgoVersion, null])
  .mockName("getters.getSvgoVersion");

export {
  getIgnoreGlobs,
  getIsDryRun,
  getIsStrictMode,
  getSvgoConfigPath,
  getSvgoVersion,
};
