// SPDX-License-Identifier: MIT

const Set = jest.fn()
  .mockReturnValue(null)
  .mockName("outputs.Set");

export default {
  Set,
};
