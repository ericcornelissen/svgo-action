const readFiles = jest.fn()
  .mockResolvedValue([[], null])
  .mockName("read.ts::readFiles");

export {
  readFiles,
};
