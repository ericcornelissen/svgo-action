// SPDX-License-Identifier: MIT

const parsedContent = { };

const jsEval = jest.fn()
  .mockReturnValue(parsedContent)
  .mockName("parsers.jsEval");

export {
  jsEval,
};
