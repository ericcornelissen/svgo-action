import type { OutputName } from "../../../src/outputs/names";

import { mocked } from "ts-jest/utils";

jest.mock("../../../src/errors");
jest.mock("../../../src/outputs/names");
jest.mock("../../../src/outputs/values");
jest.mock("../../../src/outputs/write");

import errors from "../../../src/errors";
import outputs from "../../../src/outputs/index";
import * as _names from "../../../src/outputs/names";
import * as _values from "../../../src/outputs/values";
import * as _write from "../../../src/outputs/write";
import out from "../../__common__/outputter.mock";

const getOutputNamesFor = mocked(_names.getOutputNamesFor);
const getValuesForOutputs = mocked(_values.getValuesForOutputs);
const writeOutputs = mocked(_write.writeOutputs);

describe("outputs/index.js", () => {
  const data = {
    optimizedCount: 3,
    svgCount: 14,
  };
  const env = {
    context: {
      eventName: "push",
    },
  };

  beforeEach(() => {
    getOutputNamesFor.mockClear();
    getValuesForOutputs.mockClear();
    writeOutputs.mockClear();
  });

  test("gets the output names for the event", () => {
    outputs.Set({ env, data, out });

    expect(getOutputNamesFor).toHaveBeenCalledTimes(1);
    expect(getOutputNamesFor).toHaveBeenCalledWith(env.context.eventName);
  });

  test("gets the values for the provided output names", () => {
    const names: OutputName[] = [
      "foo",
      "bar",
    ] as unknown as OutputName[];

    getOutputNamesFor.mockReturnValueOnce([
      names,
      null,
    ]);

    outputs.Set({ env, data, out });

    expect(getValuesForOutputs).toHaveBeenCalledTimes(1);
    expect(getValuesForOutputs).toHaveBeenCalledWith(names, data);
  });

  test("writes the provided values using the outputter", () => {
    const nameToValue: Map<OutputName, string> = new Map();

    getValuesForOutputs.mockReturnValueOnce(nameToValue);

    outputs.Set({ env, data, out });

    expect(writeOutputs).toHaveBeenCalledTimes(1);
    expect(writeOutputs).toHaveBeenCalledWith(out, nameToValue);
  });

  test("no error", () => {
    getOutputNamesFor.mockReturnValueOnce([[], null]);

    const err = outputs.Set({ env, data, out });
    expect(err).toBeNull();
  });

  test("get output names errors", () => {
    getOutputNamesFor.mockReturnValueOnce([
      [],
      errors.New("no names found"),
    ]);

    const err = outputs.Set({ env, data, out });
    expect(err).not.toBeNull();
  });
});
