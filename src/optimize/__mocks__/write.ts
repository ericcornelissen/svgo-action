const writeFiles = jest.fn()
  .mockResolvedValue(null)
  .mockName("optimize.writeFiles");

export {
  writeFiles,
};
