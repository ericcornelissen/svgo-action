import type { Outputter } from "../../src/types";

type OutputterMock = jest.Mocked<Outputter>;

const outputterMock: OutputterMock = {
  setOutput: jest.fn()
    .mockName("outputter.setOutput"),
};

export default outputterMock;
