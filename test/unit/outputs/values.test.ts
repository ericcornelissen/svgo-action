import { OutputName } from "../../../src/outputs/names";

import {
  getValuesForOutputs,
} from "../../../src/outputs/values";

describe("outputs/values.js", () => {
  const baseData = {
    optimizedCount: 3,
    svgCount: 14,
  };

  test("values for an empty list of names", () => {
    const names = [];

    const result = getValuesForOutputs(names, baseData);
    expect(result.size).toBe(0);
  });

  describe("values for only DID_OPTIMIZE", () => {
    const names = [
      OutputName.DID_OPTIMIZE,
    ];

    test("when nothing was optimized", () => {
      const data = {
        ...baseData,
        optimizedCount: 0,
      };

      const result = getValuesForOutputs(names, data);
      expect(result.size).toBe(1);
      expect(result.get(OutputName.DID_OPTIMIZE)).toBe("false");
    });

    test.each([
      1,
      2,
      42,
    ])("when something was optimized (count: %s)", (optimizedCount) => {
      const data = {
        ...baseData,
        optimizedCount,
      };

      const result = getValuesForOutputs(names, data);
      expect(result.size).toBe(1);
      expect(result.get(OutputName.DID_OPTIMIZE)).toBe("true");
    });
  });

  describe("values for only OPTIMIZED_COUNT", () => {
    const names = [
      OutputName.OPTIMIZED_COUNT,
    ];

    test.each([
      0,
      1,
      2,
      42,
    ])("optimized count is %s", (optimizedCount) => {
      const data = {
        ...baseData,
        optimizedCount,
      };

      const result = getValuesForOutputs(names, data);
      expect(result.size).toBe(1);
      expect(result.get(OutputName.OPTIMIZED_COUNT)).toBe(`${optimizedCount}`);
    });
  });

  describe("values for only SVG_COUNT", () => {
    const names = [
      OutputName.SVG_COUNT,
    ];

    test.each([
      0,
      1,
      2,
      42,
    ])("optimized count is %s", (svgCount) => {
      const data = {
        ...baseData,
        svgCount,
      };

      const result = getValuesForOutputs(names, data);
      expect(result.size).toBe(1);
      expect(result.get(OutputName.SVG_COUNT)).toBe(`${svgCount}`);
    });
  });

  describe("multiple values", () => {
    test("with DID_OPTIMIZE and OPTIMIZED_COUNT", () => {
      const names = [
        OutputName.DID_OPTIMIZE,
        OutputName.OPTIMIZED_COUNT,
      ];

      const result = getValuesForOutputs(names, baseData);
      expect(result.size).toBe(2);
    });

    test("with DID_OPTIMIZE and SVG_COUNT", () => {
      const names = [
        OutputName.DID_OPTIMIZE,
        OutputName.SVG_COUNT,
      ];

      const result = getValuesForOutputs(names, baseData);
      expect(result.size).toBe(2);
    });

    test("with OPTIMIZED_COUNT and SVG_COUNT", () => {
      const names = [
        OutputName.OPTIMIZED_COUNT,
        OutputName.SVG_COUNT,
      ];

      const result = getValuesForOutputs(names, baseData);
      expect(result.size).toBe(2);
    });

    test("with DID_OPTIMIZE, OPTIMIZED_COUNT, SVG_COUNT", () => {
      const names = [
        OutputName.DID_OPTIMIZE,
        OutputName.OPTIMIZED_COUNT,
        OutputName.SVG_COUNT,
      ];

      const result = getValuesForOutputs(names, baseData);
      expect(result.size).toBe(3);
    });
  });
});
