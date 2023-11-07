// SPDX-License-Identifier: MIT

const parsedObject = { };

const parser = jest.fn()
  .mockReturnValue([parsedObject, null]);

export {
  parser,
};
