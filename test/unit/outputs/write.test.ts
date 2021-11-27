import type { OutputName } from "../../../src/outputs/names";

import out from "../../__common__/outputter.mock";

import {
  writeOutputs,
} from "../../../src/outputs/write";

describe("outputs/write.js", () => {
  beforeEach(() => {
    out.setOutput.mockClear();
  });

  test("with no values", () => {
    const map = new Map();

    writeOutputs(out, map);
    expect(out.setOutput).not.toHaveBeenCalled();
  });

  test.each([
    new Map([
      ["foo", "bar"],
    ]),
    new Map([
      ["foo", "bar"],
      ["Hello", "World!"],
    ]),
  ])("with some values, %#", (map) => {
    writeOutputs(out, map as Map<OutputName, string>);
    expect(out.setOutput).toHaveBeenCalledTimes(map.size);
    for (const [key, value] of map) {
      expect(out.setOutput).toHaveBeenCalledWith(key, value);
    }
  });
});
