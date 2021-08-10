const event = "push";

const getFilters = jest.fn()
  .mockResolvedValue([[], null])
  .mockName("helpers.isEventSupported");

const isClientRequired = jest.fn()
  .mockReturnValue(false)
  .mockName("helpers.isClientRequired");

const isEventSupported = jest.fn()
  .mockReturnValue([event, true])
  .mockName("helpers.isEventSupported");

const parseRawSvgoConfig = jest.fn()
  .mockReturnValue([{ }, null])
  .mockName("helpers.isEventSupported");

export {
  getFilters,
  isClientRequired,
  isEventSupported,
  parseRawSvgoConfig,
};
