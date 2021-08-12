const parseRawSvgoConfig = jest.fn()
  .mockReturnValue([{ }, null])
  .mockName("helpers.parseRawSvgoConfig");

export {
  parseRawSvgoConfig,
};
