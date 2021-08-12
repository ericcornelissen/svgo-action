const event = "push";

const isClientRequired = jest.fn()
  .mockReturnValue(false)
  .mockName("helpers.isClientRequired");

const isEventSupported = jest.fn()
  .mockReturnValue([event, true])
  .mockName("helpers.isEventSupported");

export {
  isClientRequired,
  isEventSupported,
};
