import type { Optimizer } from "../../src/optimize/types";

type OptimizerMock = jest.Mocked<Optimizer>;

const optimizer: OptimizerMock = {
  optimize: jest.fn()
    .mockImplementation((s) => [`${s} - optimized`, null])
    .mockName("optimizer.optimize"),
};

export default optimizer;
