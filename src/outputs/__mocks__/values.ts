const valuesMap = new Map();

const getValuesForOutputs = jest.fn()
  .mockReturnValue(valuesMap)
  .mockName("outputs.getValuesForOutputs");

export {
  getValuesForOutputs,
};
