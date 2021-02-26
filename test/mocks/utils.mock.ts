export const getChangedPercentage = jest.fn()
  .mockReturnValue(50)
  .mockName("utils.getChangedPercentage");

export const getFileSizeInKB = jest.fn()
  .mockReturnValue(0.314)
  .mockName("utils.getFileSizeInKB");

export const roundToPrecision = jest.fn()
  .mockReturnValue(1.62)
  .mockName("utils.roundToPrecision");
