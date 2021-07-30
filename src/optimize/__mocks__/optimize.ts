const optimizeAll = jest.fn()
  .mockResolvedValue([[], null])
  .mockName("optimize.ts::optimizeAll");

export {
  optimizeAll,
};
