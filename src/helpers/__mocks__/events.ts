const event = "push";

const isEventSupported = jest.fn()
  .mockReturnValue([event, true])
  .mockName("helpers.isEventSupported");

export default isEventSupported;
