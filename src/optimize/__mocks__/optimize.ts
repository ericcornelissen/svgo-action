const fileHandles = [];

const optimizeAll = jest.fn()
  .mockResolvedValue([fileHandles, null])
  .mockName("optimize.optimizeAll");

export {
  optimizeAll,
};
