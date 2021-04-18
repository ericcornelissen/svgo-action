import {
  getChangedPercentage,
  getFileSizeInKB,
  roundToPrecision,
} from "../src/utils";

describe("::getChangedPercentage", () => {
  test.each([
    [1, 1, 0],
    [100, 50, -50],
    [50, 100, 100],
  ])("the value %s", (before, after, expected) => {
    const actual = getChangedPercentage(before, after);
    expect(actual).toEqual(expected);
  });

  test("before is empty", () => {
    expect(getChangedPercentage(0, 0)).toEqual(0);
    expect(getChangedPercentage(0, 1)).toEqual(0);
    expect(getChangedPercentage(0, -1)).toEqual(0);
  });
});

describe("::getFileSizeInKb", () => {
  test("an empty file", () => {
    const result = getFileSizeInKB("");
    expect(result).toEqual(0);
  });

  test.each([
    ["foobar", 0.006],
    ["Hello world!", 0.012],
  ])("a non-empty file", (content, expected) => {
    const actual = getFileSizeInKB(content);
    expect(actual).toEqual(expected);
  });
});

describe("::roundToPrecision", () => {
  test.each([
    [3, 0, 3],
    [3, 1, 3],
    [3, 2, 3],
    [3, 3, 3],
    [3.1, 0, 3],
    [3.1, 1, 3.1],
    [3.1, 2, 3.1],
    [3.1, 3, 3.1],
    [3.14, 0, 3],
    [3.14, 1, 3.1],
    [3.14, 2, 3.14],
    [3.14, 3, 3.14],
    [3.141, 0, 3],
    [3.141, 1, 3.1],
    [3.141, 2, 3.14],
    [3.141, 3, 3.141],
    [1.5, 0, 2],
    [1.55, 1, 1.6],
  ])("the value %s to %s", (n, decimalPlaces, expected) => {
    const actual = roundToPrecision(n, decimalPlaces);
    expect(actual).toEqual(expected);
  });
});
