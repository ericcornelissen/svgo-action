const optimizeAll = jest.fn()
  .mockResolvedValue([[], null])
  .mockName("optimize.optimizeAll");

export {
  optimizeAll,
};
