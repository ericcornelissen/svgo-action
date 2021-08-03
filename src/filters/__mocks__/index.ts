const filter = () => false;

const NewGlobFilter = jest.fn()
  .mockReturnValue(filter)
  .mockName("filters.NewGlobFilter");

const NewPrFilesFilter = jest.fn()
  .mockReturnValue([filter, null])
  .mockName("filters.NewPrFilesFilter");

const NewPushedFilesFilter = jest.fn()
  .mockReturnValue([filter, null])
  .mockName("filters.NewPushedFilesFilter");

const NewSvgsFilter = jest.fn()
  .mockReturnValue(filter)
  .mockName("filters.NewSvgsFilter");

export default {
  NewGlobFilter,
  NewPrFilesFilter,
  NewPushedFilesFilter,
  NewSvgsFilter,
};
