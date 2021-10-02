const NewPushedFilesFilter = jest.fn()
  .mockReturnValue([() => false, null])
  .mockName("filters.NewPushedFilesFilter");

export default NewPushedFilesFilter;
