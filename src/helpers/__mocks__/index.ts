const event = "push";

const getFilters = jest.fn()
  .mockResolvedValue([[], null])
  .mockName("helpers.getFilters");

const isClientRequired = jest.fn()
  .mockReturnValue(false)
  .mockName("helpers.isClientRequired");

const isEventSupported = jest.fn()
  .mockReturnValue([event, true])
  .mockName("helpers.isEventSupported");

const parseRawSvgoConfig = jest.fn()
  .mockReturnValue([{ }, null])
  .mockName("helpers.parseRawSvgoConfig");

export {
  getFilters,
  isClientRequired,
  isEventSupported,
  parseRawSvgoConfig,
};
