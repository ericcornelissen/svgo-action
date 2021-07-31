const event = "push";

const getFilters = jest.fn()
  .mockResolvedValue([[], null])
  .mockName("helpers.isEventSupported");

const isEventSupported = jest.fn()
  .mockReturnValue([event, true])
  .mockName("helpers.isEventSupported");

const parseRawSvgoConfig = jest.fn()
  .mockReturnValue([{ }, null])
  .mockName("helpers.isEventSupported");

export {
  getFilters,
  isEventSupported,
  parseRawSvgoConfig,
};
