const getValuesForOutputs = jest.fn()
  .mockReturnValue(new Map())
  .mockName("outputs.getValuesForOutputs");

export {
  getValuesForOutputs,
};
