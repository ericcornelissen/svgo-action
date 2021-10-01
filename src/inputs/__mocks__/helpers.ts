const getDefaultSvgoConfigPath = jest.fn()
  .mockReturnValue("svgo.config.js")
  .mockName("helpers.getIgnoreGlobs");

export {
  getDefaultSvgoConfigPath,
};
