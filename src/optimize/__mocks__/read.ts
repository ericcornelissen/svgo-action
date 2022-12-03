const fileHandles = [];

const yieldFiles = jest.fn()
  .mockResolvedValue(fileHandles)
  .mockName("optimize.yieldFiles");

export {
  yieldFiles,
};
