const create = jest.fn()
  .mockReturnValue({
    glob: jest.fn()
      .mockReturnValue([])
      .mockName("globber.glob"),
  })
  .mockName("glob.create");

export {
  create,
};
