const fileHandles = [];

const readFiles = jest.fn()
  .mockResolvedValue([fileHandles, null])
  .mockName("optimize.readFiles");

export {
  readFiles,
};
