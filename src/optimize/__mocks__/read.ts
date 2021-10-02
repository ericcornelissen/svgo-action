const readFiles = jest.fn()
  .mockResolvedValue([[], null])
  .mockName("optimize.readFiles");

export {
  readFiles,
};
