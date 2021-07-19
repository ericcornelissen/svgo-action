import * as outputs from "../../src/outputs";

type SetOutputValuesMock = jest.MockedFunction<typeof outputs.setOutputValues>;

const setOutputValues: SetOutputValuesMock = jest.fn()
  .mockReturnValue(null)
  .mockName("setOutputValues");

export default {
  setOutputValues,
};
