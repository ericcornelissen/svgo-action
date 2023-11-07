// SPDX-License-Identifier: MIT

const data = { };

const Files = jest.fn()
  .mockReturnValue([data, null])
  .mockName("optimize.Files");

export default {
  Files,
};
