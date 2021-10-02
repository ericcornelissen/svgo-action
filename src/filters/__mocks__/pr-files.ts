const NewPrFilesFilter = jest.fn()
  .mockReturnValue([() => false, null])
  .mockName("filters.NewPrFilesFilter");

export default NewPrFilesFilter;
