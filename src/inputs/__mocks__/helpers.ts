// SPDX-License-Identifier: MIT

const getDefaultSvgoConfigPath = jest.fn()
  .mockReturnValue("svgo.config.js")
  .mockName("inputs.getDefaultSvgoConfigPath");

export {
  getDefaultSvgoConfigPath,
};
