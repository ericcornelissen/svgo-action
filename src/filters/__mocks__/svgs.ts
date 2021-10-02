const NewSvgsFilter = jest.fn()
  .mockReturnValue([() => false, null])
  .mockName("filters.NewSvgsFilter");

export default NewSvgsFilter;
