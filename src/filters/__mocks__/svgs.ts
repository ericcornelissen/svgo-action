const NewSvgsFilter = jest.fn()
  .mockReturnValue([() => false, null])
  .mockName("NewSvgsFilter");

export default NewSvgsFilter;
