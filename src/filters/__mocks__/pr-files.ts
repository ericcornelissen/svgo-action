const NewPrFilesFilter = jest.fn()
  .mockReturnValue([() => false, null])
  .mockName("NewPrFilesFilter");

export default NewPrFilesFilter;
