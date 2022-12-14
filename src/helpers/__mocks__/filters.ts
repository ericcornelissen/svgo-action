const filters: Iterable<never> = [];

const getFilters = jest.fn()
  .mockResolvedValue([filters, null])
  .mockName("helpers.getFilters");

export {
  getFilters,
};
