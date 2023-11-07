// SPDX-License-Identifier: MIT

const getOutputNamesFor = jest.fn()
  .mockReturnValue([[], null])
  .mockName("outputs.getOutputNamesFor");

export {
  getOutputNamesFor,
};
