const getOutputNamesFor = jest.fn()
  .mockReturnValue([[], null])
  .mockName("outputs.getOutputNamesFor");

export {
  getOutputNamesFor,
};
