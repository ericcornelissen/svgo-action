const fileHandles = [];

const readFiles = jest.fn()
  .mockResolvedValue([fileHandles, null])
  .mockName("optimize.readFiles");

const yieldFiles = jest.fn()
  .mockResolvedValue(fileHandles)
  .mockName("optimize.yieldFiles");

export {
  readFiles,
  yieldFiles,
};
