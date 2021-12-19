const svgoConfig = { };

const parseRawSvgoConfig = jest.fn()
  .mockReturnValue([svgoConfig, null])
  .mockName("helpers.parseRawSvgoConfig");

export {
  parseRawSvgoConfig,
};
