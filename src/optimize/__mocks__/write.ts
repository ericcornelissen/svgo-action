const writeFiles = jest.fn()
  .mockResolvedValue(null)
  .mockName("write.ts::writeFiles");

export {
  writeFiles,
};
