const NewPushedFilesFilter = jest.fn()
  .mockReturnValue([() => false, null])
  .mockName("NewPushedFilesFilter");

export default NewPushedFilesFilter;
