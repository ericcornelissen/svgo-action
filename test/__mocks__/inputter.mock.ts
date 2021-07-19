import type { Inputter } from "../../src/types";

type InputterMock = jest.Mocked<Inputter>;

const inputterMock: InputterMock = {
  getBooleanInput: jest.fn()
    .mockReturnValue(false)
    .mockName("inputter.getBooleanInput"),
  getInput: jest.fn()
    .mockReturnValue("")
    .mockName("inputter.getInput"),
};

export default inputterMock;
