const getDefaultSvgoConfigPath = jest.fn()
  .mockReturnValue("svgo.config.js")
  .mockName("inputs.getDefaultSvgoConfigPath");

export {
  getDefaultSvgoConfigPath,
};
