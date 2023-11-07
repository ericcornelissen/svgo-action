// SPDX-License-Identifier: MIT

import type { Inputter } from "../../src/inputs";

type InputterMock = jest.Mocked<Inputter>;

const inputter: InputterMock = {
  getBooleanInput: jest.fn()
    .mockReturnValue(false)
    .mockName("inputter.getBooleanInput"),
  getInput: jest.fn()
    .mockReturnValue("")
    .mockName("inputter.getInput"),
  getMultilineInput: jest.fn()
    .mockReturnValue([])
    .mockName("inputter.getMultilineInput"),
};

export default inputter;
