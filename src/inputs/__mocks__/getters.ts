// SPDX-License-Identifier: MIT

import { defaultConfig } from "./__common__";

const getIgnoreGlobs = jest.fn()
  .mockReturnValue([defaultConfig.ignoreGlobs, null])
  .mockName("inputs.getIgnoreGlobs");

const getIsDryRun = jest.fn()
  .mockReturnValue([defaultConfig.isDryRun, null])
  .mockName("inputs.getIsDryRun");

const getIsStrictMode = jest.fn()
  .mockReturnValue([defaultConfig.isStrictMode, null])
  .mockName("inputs.getIsStrictMode");

const getSvgoConfigPath = jest.fn()
  .mockReturnValue([defaultConfig.svgoConfigPath, null])
  .mockName("inputs.getSvgoConfigPath");

const getSvgoVersion = jest.fn()
  .mockReturnValue([defaultConfig.svgoVersion, null])
  .mockName("inputs.getSvgoVersion");

export {
  getIgnoreGlobs,
  getIsDryRun,
  getIsStrictMode,
  getSvgoConfigPath,
  getSvgoVersion,
};
